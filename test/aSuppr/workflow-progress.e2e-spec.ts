import { INestApplication } from "@nestjs/common";
import { IContactResponse } from "src/modules/contact/entity/contact.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { ApiCall } from "./api-call.class";
import { INetworkResponse } from "../src/modules/network/entity/network.interface";
import { IWorkflowResponse } from "../src/modules/workflow/entity/workflow.interface";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addNetworkToDB } from "./mocks/network.mock";
import { addWorkflowToDB } from "./mocks/workflow.mock";
import { addWorkflowProgressToDB } from "./mocks/workflow-progress.mock";
import { IWorkflowProgressResponse } from "../src/modules/workflow-progress/entity/workflow-progress.interface";
import { UpdateWorkflowProgressDto } from "../src/modules/workflow-progress/dto";
import { addContactToDB } from "./mocks/contact.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { EFlagListValue } from "../src/modules/list-value/entity/list-value.enum";

describe("WorkflowProgressController", () => {
	let nestApp: INestApplication;
	let route = "/workflow-progress";
	let apiCall: ApiCall;

	let networkDB: INetworkResponse;
	let workflowDB: IWorkflowResponse;
	let workflowProgressDB: IWorkflowProgressResponse;
	let baseListValue: IListValueResponse;
	let baseActor: IContactResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[networkDB, baseListValue] = await Promise.all([
			addNetworkToDB({ nestApp }),
			addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY }),
		]);

		[workflowDB, baseActor] = await Promise.all([
			addWorkflowToDB({ nestApp, network: networkDB }),
			addContactToDB({ nestApp, civility: baseListValue }),
		]);

		workflowProgressDB = await addWorkflowProgressToDB({ nestApp, workflow: workflowDB, actor: baseActor });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("GET", () => {
		describe("(/)", () => {
			it("Should return a list of workflow progress", async () => {
				const { body, status } = await apiCall.get(route);

				expect(status).toBe(200);
				expect(body).toBeDefined();

				const {
					count,
					data,
					offset,
					total,
					limit,
					offsetMax,
				}: {
					total: number;
					count: number;
					limit: number;
					offset: number;
					offsetMax: number;
					data: IWorkflowProgressResponse[];
				} = body;

				expect(count).toBe(1);
				expect(total).toBe(1);
				expect(offset).toBe(0);
				expect(offsetMax).toBe(0);
				expect(limit).toBe(25);
				expect(data.length).toBe(1);

				for (let i = 0; i < data.length; i += 1) {
					const { id, completion, createdAt, steps, workflow, actor }: IWorkflowProgressResponse = data[i];

					expect(id).toBeDefined();
					expect(workflow).toBeDefined();
					expect(completion).toBeDefined();
					expect(createdAt).toBeDefined();
					expect(actor).toBeDefined();
					expect(steps).toBeDefined();
				}
			});
		});
		describe("(/:id)", () => {
			it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
				// @ts-ignore
				const { status } = await apiCall.get(route, id);

				expect(status).toBe(400);
			});

			it("Should return a workflow progress", async () => {
				const { body, status } = await apiCall.get(`${route}/${workflowProgressDB.id}`);

				expect(status).toBe(200);

				const {
					id,
					completion,
					createdAt,
					steps,
					workflow,
					actor,
					deletedAt,
					updatedAt,
				}: IWorkflowProgressResponse = body;
				expect(id).toBe(workflowProgressDB.id);
				expect(completion).toBe(workflowProgressDB.completion);
				expect(createdAt).toBeDefined();
				expect(updatedAt).toBeDefined();
				expect(workflow.id).toBe(workflowDB.id);
				expect(actor.id).toBe(baseActor.id);
				expect(steps).toBeDefined();
				expect(deletedAt).toBeNull();
			});
		});
	});
	describe("UPDATE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should set all optional values to null", async () => {
			const { body, status } = await apiCall.put(route, workflowProgressDB.id, {
				actorId: null,
			} as UpdateWorkflowProgressDto);

			expect(status).toBe(200);

			const { id, completion, actor }: IWorkflowProgressResponse = body;

			expect(id).toBe(workflowProgressDB.id);
			expect(completion).toBe(workflowProgressDB.completion);
			expect(actor).toBeNull();
		});

		it("Should not set mandatory values to null", async () => {
			const { body, status } = await apiCall.put(route, workflowProgressDB.id, {
				steps: null,
			} as UpdateWorkflowProgressDto);

			expect(status).toBe(200);

			const { id, completion, steps }: IWorkflowProgressResponse = body;

			expect(id).toBe(workflowProgressDB.id);
			expect(completion).toBe(workflowProgressDB.completion);
			expect(steps).not.toBeNull();
		});

		it("Should update a workflow progress", async () => {
			const listValueDB = await addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY });
			const contact = await addContactToDB({ nestApp, civility: listValueDB });

			const { body, status } = await apiCall.put(route, workflowProgressDB.id, {
				actorId: contact.id,
			} as UpdateWorkflowProgressDto);

			expect(status).toBe(200);

			const { id, completion, actor }: IWorkflowProgressResponse = body;

			expect(id).toBe(workflowProgressDB.id);
			expect(completion).toBe(workflowProgressDB.completion);
			expect(actor.id).toBe(contact.id);
		});

		it("Should not update completion", async () => {
			const { body, status } = await apiCall.put(route, workflowProgressDB.id, {
				completion: 71.11,
			} as UpdateWorkflowProgressDto);

			expect(status).toBe(200);
			expect(body.completion).toBe(workflowProgressDB.completion);
		});
	});
});
