import { INestApplication } from "@nestjs/common";
import { trimAndUppercase } from "@asrec/misc";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addNetworkToDB } from "./mocks/network.mock";
import { INetworkResponse } from "../src/modules/network/entity/network.interface";
import { addWorkflowToDB, createWorkflowMock, getWorkflowFromDB, updateWorkflowMock } from "./mocks/workflow.mock";
import { CreateWorkflowDto, UpdateWorkflowDto } from "../src/modules/workflow/dto";
import { IWorkflowResponse } from "../src/modules/workflow/entity/workflow.interface";
import { addEventAreaToDB } from "./mocks/event-area.mock";
import { IEventAreaResponse } from "../src/modules/event-area/entity/event-area.interface";
import { ETypeWorkflow } from "../src/modules/workflow/entity/type-workflow.enum";
import { addServiceToDB } from "./mocks/service.mock";
import { addFamilyServiceToDB } from "./mocks/family-service.mock";

describe("WorkflowController", () => {
	let nestApp: INestApplication;
	let route = "/workflow";
	let apiCall: ApiCall;

	let networkDB: INetworkResponse;
	let workflowDB: IWorkflowResponse;
	let eventAreaDB: IEventAreaResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		networkDB = await addNetworkToDB({ nestApp });

		const familyServiceDB = await addFamilyServiceToDB({ nestApp, network: networkDB });

		eventAreaDB = await addEventAreaToDB({ nestApp, network: networkDB });

		[workflowDB] = await Promise.all([
			addWorkflowToDB({ nestApp, network: networkDB, type: ETypeWorkflow.DEVIS, stepsNumber: 10 }),
		]);
		await addServiceToDB({ nestApp, familyService: familyServiceDB, workflow: workflowDB });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE", () => {
		it("Should not create a workflow without the required values", async () => {
			const { status } = await apiCall.post(route, {});

			expect(status).toBe(400);
		});

		it.each([ETypeWorkflow.DEVIS, ETypeWorkflow.PRESTATION])(
			"Should not create a workflow linked to an eventArea if the type isn't 'EVENEMENT'",
			async (type) => {
				const createWorkflowDto: CreateWorkflowDto = createWorkflowMock({
					networkId: networkDB.id,
					type,
					eventAreaId: eventAreaDB.id,
				});

				const { status } = await apiCall.post(route, createWorkflowDto);

				expect(status).toBe(400);
			},
		);

		it("Should not create a workflow linked to an eventArea if eventAreaId is missing", async () => {
			const createWorkflowDto: CreateWorkflowDto = createWorkflowMock({
				networkId: networkDB.id,
				type: ETypeWorkflow.EVENEMENT,
			});

			const { status } = await apiCall.post(route, createWorkflowDto);

			expect(status).toBe(400);
		});

		it("Should create a workflow with only the required values", async () => {
			const createWorkflowDto: CreateWorkflowDto = createWorkflowMock({
				networkId: networkDB.id,
				type: ETypeWorkflow.PRESTATION,
			});

			const { status, body } = await apiCall.post(route, createWorkflowDto);

			expect(status).toBe(201);

			const { name, network, steps, type } = await getWorkflowFromDB({ nestApp, id: body.id });

			expect(name).toBe(trimAndUppercase(createWorkflowDto.name));
			expect(network.id).toBe(createWorkflowDto.networkId);
			expect(steps).toEqual(createWorkflowDto.steps);
			expect(type).toBe(createWorkflowDto.type);
		});
	});

	describe("UPDATE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([ETypeWorkflow.DEVIS, ETypeWorkflow.PRESTATION])(
			"Should not update a workflow's eventArea if the type isnt 'EVENEMENT'",
			async (type) => {
				const workflow = await addWorkflowToDB({ nestApp, network: networkDB, type });

				const updateWorkflowDto: UpdateWorkflowDto = updateWorkflowMock({ eventAreaId: eventAreaDB.id });

				const { status } = await apiCall.put(route, workflow.id, updateWorkflowDto);

				expect(status).toBe(404);
			},
		);

		it("Should not set eventAreaId to null, if type is 'EVENEMENT'", async () => {
			const workflow = await addWorkflowToDB({ nestApp, network: networkDB, type: ETypeWorkflow.EVENEMENT });

			const updateWorkflowDto: UpdateWorkflowDto = updateWorkflowMock({ eventAreaId: null });

			const { status } = await apiCall.put(route, workflow.id, updateWorkflowDto);

			expect(status).toBe(404);
		});

		it("Should not set steps to null", async () => {
			const updateWorkflowDto = updateWorkflowMock({ stepsNumber: 0 });

			const { status } = await apiCall.put(route, workflowDB.id, updateWorkflowDto);

			expect(status).toBe(200);

			const { steps } = await getWorkflowFromDB({ nestApp, id: workflowDB.id });

			expect(steps).toEqual(workflowDB.steps);
		});

		it("Should update all values", async () => {
			const updateWorkflowDto: UpdateWorkflowDto = updateWorkflowMock({});
			const { status } = await apiCall.put(route, workflowDB.id, updateWorkflowDto);

			expect(status).toBe(200);

			const { name, network, steps, type } = await getWorkflowFromDB({ nestApp, id: workflowDB.id });

			expect(network.id).toBe(networkDB.id);
			expect(name).toBe(trimAndUppercase(updateWorkflowDto.name));
			expect(steps).toEqual(updateWorkflowDto.steps);
			expect(type).toBe(workflowDB.type);
		});
	});

	describe("GET", () => {
		describe("(/:id)", () => {
			it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
				// @ts-ignore
				const { status } = await apiCall.get(route, id);

				expect(status).toBe(400);
			});

			it("Should get a workflow", async () => {
				const { status, body } = await apiCall.get(route, workflowDB.id);

				expect(status).toBe(200);

				const { name, network, steps, type } = body;

				expect(network.id).toBe(networkDB.id);
				expect(name).toBe(trimAndUppercase(workflowDB.name));
				expect(steps).toEqual(workflowDB.steps);
				expect(type).toBe(workflowDB.type);
			});
		});

		describe("(/network/:network)", () => {
			it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
				// @ts-ignore
				const { status } = await apiCall.get(route, `network/${id}`);

				expect(status).toBe(400);
			});

			it("Should get all workflows", async () => {
				const { status, body } = await apiCall.get(route, `network/${networkDB.id}`);

				expect(status).toBe(200);

				expect(body.total).toEqual(1);
				expect(body.count).toEqual(1);
				expect(body.limit).toEqual(25);
				expect(body.offset).toEqual(0);
				expect(body.offsetMax).toEqual(0);
				expect(body.data.length).toEqual(1);

				body.data.forEach((workflow: IWorkflowResponse) => {
					expect(workflow.name).toBeDefined();
					expect(workflow.type).toBeDefined();
					expect(workflow.steps).toBeDefined();
					expect(workflow.network).toBeDefined();
				});
			});
		});
	});

	describe("DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a workflow that doesnt exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a workflow", async () => {
			const { status } = await apiCall.delete(route, workflowDB.id);

			expect(status).toBe(200);
		});
	});
});
