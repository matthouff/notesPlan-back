import { INestApplication } from "@nestjs/common";
import { ETypeWorkflow } from "src/modules/workflow/entity/type-workflow.enum";
import { INetworkResponse } from "../src/modules/network/entity/network.interface";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { ApiCall } from "./api-call.class";
import { addNetworkToDB } from "./mocks/network.mock";
import { addEventAreaToDB } from "./mocks/event-area.mock";
import {
	addEventTrackingToDB,
	addManyEventTrackingToDB,
	createEventTrackingMock,
	getEventTrackingFromDB,
	updateEventTrackingMock,
} from "./mocks/event-tracking.mock";
import { addManyWorkflowProgressToDB, addWorkflowProgressToDB } from "./mocks/workflow-progress.mock";
import { IEventTrackingResponse } from "../src/modules/event-tracking/entity/event-tracking.interface";
import { IExerciseResponse } from "../src/modules/exercise/entity/exercise.interface";
import { IWorkflowResponse } from "../src/modules/workflow/entity/workflow.interface";
import { addListValueToDB } from "./mocks/list-value.mock";
import { EFlagListValue } from "../src/modules/list-value/entity/list-value.enum";
import { IOrganizationResponse } from "../src/modules/organization/entity/organization.interface";
import { addWorkflowToDB } from "./mocks/workflow.mock";
import { addExerciseToDB } from "./mocks/exercise.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { CreateEventTrackingDto, UpdateEventTrackingDto } from "../src/modules/event-tracking/dto";
import { IWorkflowProgressResponse } from "../src/modules/workflow-progress/entity/workflow-progress.interface";
import { IListValueResponse } from "../src/modules/list-value/entity/list-value.interface";

describe("EventTrackingController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/event-tracking";
	let apiCall: ApiCall;

	let networkDB: INetworkResponse;
	let eventTrackingDB: IEventTrackingResponse;
	let exerciseDB: IExerciseResponse;
	let workflowDB: IWorkflowResponse;
	let workflowProgressDB: IWorkflowProgressResponse;
	let organizationDB: IOrganizationResponse;
	let typeDB: IListValueResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		networkDB = await addNetworkToDB({ nestApp });

		const eventAreaDB = await addEventAreaToDB({ nestApp, network: networkDB });

		typeDB = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });

		[workflowDB, exerciseDB, organizationDB] = await Promise.all([
			addWorkflowToDB({
				nestApp,
				network: networkDB,
				eventArea: eventAreaDB,
				type: ETypeWorkflow.EVENEMENT,
				stepsNumber: 5,
			}),
			addExerciseToDB({ nestApp }),
			addOrganizationToDB({ nestApp, type: typeDB }),
		]);

		// addOrganizationToDB({ nestApp });
		workflowProgressDB = await addWorkflowProgressToDB({ nestApp, workflow: workflowDB, numberOfSteps: 5 });

		eventTrackingDB = await addEventTrackingToDB({
			nestApp,
			workflow: workflowDB,
			network: networkDB,
			exercise: exerciseDB,
			workflowProgress: workflowProgressDB,
			organization: organizationDB,
		});

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE", () => {
		it("Should not create an eventTracking without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should not create an eventTracking while receiving invalid data", async () => {
			const createEventTrackingDto: CreateEventTrackingDto = createEventTrackingMock({
				exerciseId: "",
				networkId: "",
				workflowId: "",
				organizationId: "",
			});

			const { status } = await apiCall.post(route, createEventTrackingDto);

			expect(status).toBe(400);
		});

		it("Should create an eventTracking", async () => {
			const createEventTrackingDto: CreateEventTrackingDto = createEventTrackingMock({
				exerciseId: exerciseDB.id,
				networkId: networkDB.id,
				workflowId: workflowDB.id,
				organizationId: organizationDB.id,
			});

			const { body, status } = await apiCall.post<CreateEventTrackingDto>(route, createEventTrackingDto);

			expect(status).toBe(201);

			const response = await getEventTrackingFromDB({ nestApp, id: body.id });

			expect(response.id).toEqual(body.id);
			expect(response.network.id).toEqual(body.network.id);
			expect(response.exercise.id).toEqual(body.exercise.id);
			expect(response.workflowProgress.id).toEqual(body.workflowProgress.id);
			expect(response.organization.id).toEqual(body.organization.id);
		});
	});

	describe("GET", () => {
		describe("(network/:networkId)", () => {
			it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
				// @ts-ignore
				const { status } = await apiCall.get(route, `network/${id}`);

				expect(status).toBe(400);
			});

			it("Should get a list of eventTrackings by network", async () => {
				const newNetworkDB = await addNetworkToDB({ nestApp, name: "test_unique" });

				const [listWorkflowProgressOne, listWorkflowProgressTwo] = await Promise.all([
					addManyWorkflowProgressToDB({
						nestApp,
						workflow: workflowDB,
						numberOfSteps: 5,
						numberOfRows: 2,
					}),
					addManyWorkflowProgressToDB({
						nestApp,
						workflow: workflowDB,
						numberOfSteps: 5,
						numberOfRows: 6,
					}),
				]);

				await Promise.all([
					addManyEventTrackingToDB({
						nestApp,
						workflow: workflowDB,
						network: networkDB,
						exercise: exerciseDB,
						listWorkflowProgress: listWorkflowProgressOne,
						organization: organizationDB,
					}),
					addManyEventTrackingToDB({
						nestApp,
						workflow: workflowDB,
						network: newNetworkDB,
						exercise: exerciseDB,
						listWorkflowProgress: listWorkflowProgressTwo,
						organization: organizationDB,
					}),
				]);

				const { status, body } = await apiCall.get(`${route}/network/${newNetworkDB.id}`);

				expect(status).toBe(200);
				const {
					total,
					count,
					limit,
					offset,
					offsetMax,
					data,
				}: {
					total: number;
					limit: number;
					offset: number;
					offsetMax: number;
					count: number;
					data: IEventTrackingResponse[];
				} = body;

				expect(total).toEqual(6);
				expect(count).toEqual(6);
				expect(limit).toEqual(25);
				expect(offset).toEqual(0);
				expect(offsetMax).toEqual(0);

				for (let i = 0; i < data.length; i += 1) {
					const eventTracking = data[i];
					expect(eventTracking.exercise).toBeDefined();
					expect(eventTracking.workflowProgress).toBeDefined();
					expect(eventTracking.organization).toBeDefined();
					expect(eventTracking.comment).toBeDefined();
				}
			});

			it("Should get a list of eventTrackings by a network and an organization", async () => {
				const [
					networkOne,
					networkTwo,
					organizationOne,
					organizationTwo,
					listWorkflowProgressOne,
					listWorkflowProgressTwo,
				] = await Promise.all([
					addNetworkToDB({ nestApp }),
					addNetworkToDB({ nestApp }),
					addOrganizationToDB({ nestApp, type: typeDB }),
					addOrganizationToDB({ nestApp, type: typeDB }),
					addManyWorkflowProgressToDB({
						nestApp,
						workflow: workflowDB,
						numberOfSteps: 5,
						numberOfRows: 6,
					}),
					addManyWorkflowProgressToDB({
						nestApp,
						workflow: workflowDB,
						numberOfSteps: 5,
						numberOfRows: 2,
					}),
				]);

				await Promise.all([
					addManyEventTrackingToDB({
						nestApp,
						workflow: workflowDB,
						network: networkOne,
						exercise: exerciseDB,
						listWorkflowProgress: listWorkflowProgressOne,
						organization: organizationOne,
					}),
					addManyEventTrackingToDB({
						nestApp,
						workflow: workflowDB,
						network: networkTwo,
						exercise: exerciseDB,
						listWorkflowProgress: listWorkflowProgressTwo,
						organization: organizationTwo,
					}),
				]);

				const { status, body } = await apiCall.get(
					`${route}/network/${networkOne.id}/organization/${organizationOne.id}`,
				);

				expect(status).toBe(200);
				const {
					total,
					count,
					limit,
					offset,
					offsetMax,
					data,
				}: {
					total: number;
					limit: number;
					offset: number;
					offsetMax: number;
					count: number;
					data: IEventTrackingResponse[];
				} = body;

				expect(total).toEqual(6);
				expect(count).toEqual(6);
				expect(limit).toEqual(25);
				expect(offset).toEqual(0);
				expect(offsetMax).toEqual(0);

				for (let i = 0; i < data.length; i += 1) {
					const eventTracking = data[i];
					expect(eventTracking.exercise).toBeDefined();
					expect(eventTracking.workflowProgress).toBeDefined();
					expect(eventTracking.comment).toBeDefined();
				}
			});
		});
		describe("(/:id)", () => {
			it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
				// @ts-ignore
				const { status } = await apiCall.get(route, id, {});

				expect(status).toBe(400);
			});

			it("Should get an eventTracking", async () => {
				const { status, body } = await apiCall.get(route, eventTrackingDB.id);

				expect(status).toBe(200);
				const { id, exercise, workflowProgress, organization, comment }: IEventTrackingResponse = body;

				expect(id).toEqual(eventTrackingDB.id);
				expect(exercise.id).toEqual(exerciseDB.id);
				expect(workflowProgress.id).toEqual(workflowProgressDB.id);
				expect(organization.id).toEqual(organizationDB.id);
				expect(comment).toBeDefined();
			});
		});
	});

	describe("UPDATE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update an eventTracking", async () => {
			const newOrganization = await addOrganizationToDB({ nestApp, type: typeDB });

			const updateEventTrackingDto = updateEventTrackingMock({
				organizationId: newOrganization.id,
			});

			const { status } = await apiCall.put(route, eventTrackingDB.id, updateEventTrackingDto);
			const response = await getEventTrackingFromDB({ nestApp, id: eventTrackingDB.id });

			expect(status).toBe(200);
			expect(response.organization.id).toEqual(updateEventTrackingDto.organizationId);
			expect(response.comment).toEqual(updateEventTrackingDto.comment);
		});

		it("Should not set to null all optionals values of an organization", async () => {
			const updateOrganizationDto: UpdateEventTrackingDto = {};

			const { status } = await apiCall.put<UpdateEventTrackingDto>(
				route,
				eventTrackingDB.id,
				updateOrganizationDto,
			);

			const response = await getEventTrackingFromDB({ nestApp, id: eventTrackingDB.id });

			expect(status).toBe(200);
			expect(response.organization).toBeDefined();
			expect(response.comment).toBeDefined();
		});

		it("Should set to null all optionals values of a organization", async () => {
			const updateOrganizationDto: UpdateEventTrackingDto = {
				comment: null,
				organizationId: null,
			};

			const { status } = await apiCall.put<UpdateEventTrackingDto>(
				route,
				eventTrackingDB.id,
				updateOrganizationDto,
			);
			const response = await getEventTrackingFromDB({ nestApp, id: eventTrackingDB.id });

			expect(status).toBe(200);

			expect(response.comment).toBeNull();
			expect(response.organization).toBeNull();
		});
	});

	describe("DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete an eventTracking that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete an eventTracking", async () => {
			const { status } = await apiCall.delete(route, eventTrackingDB.id);

			expect(status).toBe(200);
		});
	});
});
