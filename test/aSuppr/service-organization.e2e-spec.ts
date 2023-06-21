import { INestApplication } from "@nestjs/common";
import { CreateServiceOrganizationDto, UpdateServiceOrganizationDto } from "src/modules/service-organization/dto";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { IServiceOrganizationResponse } from "src/modules/service-organization/entity/service-organization.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { trimAndLowercase } from "@asrec/misc";
import { IWorkflowResponse } from "src/modules/workflow/entity/workflow.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IServiceResponse } from "../src/modules/service/entity/service.interface";
import { INetworkResponse } from "../src/modules/network/entity/network.interface";
import { IFamilyServiceResponse } from "../src/modules/family-service/entity/family-service.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addServiceToDB } from "./mocks/service.mock";
import { addFamilyServiceToDB } from "./mocks/family-service.mock";
import { addNetworkToDB } from "./mocks/network.mock";
import {
	addManyServiceOrganizationToDB,
	addServiceOrganizationToDB,
	createServiceOrganizationMock,
	updateServiceOrganizationMock,
	getServiceOrganizationFromDB,
} from "./mocks/service-organization.mock";
import { addOrganizationToDB, getOrganizationFromDB } from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addManyExerciseToDB } from "./mocks/exercise.mock";
import { addWorkflowToDB } from "./mocks/workflow.mock";

describe("ServiceOrganizationController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/service-organization";
	let apiCall: ApiCall;

	let baseNetwork: INetworkResponse;
	let baseFamilyService: IFamilyServiceResponse;
	let baseListValueOrg: IListValueResponse;
	let baseListValueServ: IListValueResponse;
	let baseWorkflow: IWorkflowResponse;

	let baseOrganization: IOrganizationResponse;
	let baseService: IServiceResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);

		baseNetwork = await addNetworkToDB({ nestApp });

		[baseFamilyService, baseListValueOrg, baseListValueServ, baseWorkflow] = await Promise.all([
			addFamilyServiceToDB({ nestApp, network: baseNetwork }),
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.SERVICE_HOSTING }),
			addWorkflowToDB({ nestApp, network: baseNetwork, stepsNumber: 4 }),
		]);

		[baseOrganization, baseService] = await Promise.all([
			addOrganizationToDB({ nestApp, type: baseListValueOrg }),
			addServiceToDB({ nestApp, familyService: baseFamilyService, workflow: baseWorkflow }),
		]);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE SERVICE-ORGANIZATION - (/) - POST", () => {
		// it("Should not create a service-organization without the required values", async () => {
		// 	const response = await apiCall.post(route, {});

		// 	expect(response.status).toBe(400);
		// });

		// it("Should create a service with only required values", async () => {
		// 	const createServiceOrganizationDto: CreateServiceOrganizationDto = createServiceOrganizationMock({
		// 		organizationId: baseOrganization.id,
		// 		serviceId: baseService.id,
		// 	});

		// 	const baseStartDate = new Date();
		// 	const baseStatus = EStatusServOrg.ACTIVE;

		// 	const response = await apiCall.post<CreateServiceOrganizationDto>(route, {
		// 		organizationId: createServiceOrganizationDto.organizationId,
		// 		serviceId: createServiceOrganizationDto.serviceId,
		// 		startDate: baseStartDate,
		// 		status: baseStatus,
		// 	});

		// 	expect(response.status).toBe(201);

		// 	const { organization, service, startDate, status }: IServiceOrganizationResponse = response.body;

		// 	expect(organization).toBeDefined();
		// 	expect(service).toBeDefined();
		// 	expect(new Date(startDate).toLocaleDateString()).toEqual(baseStartDate.toLocaleDateString());
		// 	expect(status).toEqual(baseStatus);
		// });

		it("Should create a service-organization", async () => {
			const listExerciseId = await addManyExerciseToDB({ nestApp, numberOfRows: 10 });

			const createServiceOrganizationDto: CreateServiceOrganizationDto = createServiceOrganizationMock({
				organizationId: baseOrganization.id,
				serviceId: baseService.id,
				hostingId: baseListValueServ.id,
				listExerciseId: listExerciseId.map((item) => item.id),
			});

			const response = await apiCall.post<CreateServiceOrganizationDto>(route, createServiceOrganizationDto);

			expect(response.status).toBe(201);

			const {
				id,
				organization,
				service,
				startDate,
				status,
				comment,
				dateExport,
				endDate,
				hosting,
				prices,
				workflowProgress,
			}: IServiceOrganizationResponse = response.body;

			expect(id).toBeDefined();
			expect(organization).toBeDefined();
			expect(service).toBeDefined();
			expect(new Date(startDate).toLocaleDateString()).toEqual(
				createServiceOrganizationDto.startDate.toLocaleDateString(),
			);
			expect(status).toEqual(createServiceOrganizationDto.status);
			expect(comment).toEqual(trimAndLowercase(createServiceOrganizationDto.comment));
			expect(dateExport).toEqual(null);
			expect(new Date(endDate).toLocaleDateString()).toEqual(
				createServiceOrganizationDto.endDate.toLocaleDateString(),
			);
			expect(hosting).toBeDefined();
			expect(prices).toBeDefined();
			expect(workflowProgress).toBeDefined();

			const org = await getOrganizationFromDB({ nestApp, id: baseOrganization.id });

			expect(org.hostings.map((item) => item.id)).toContainEqual(hosting.id);
		});

		// it("Should not create a service while receiving invalid data", async () => {
		// 	const values = [
		// 		{
		// 			...createServiceOrganizationMock({
		// 				organizationId: baseOrganization.id,
		// 				serviceId: baseService.id,
		// 			}),
		// 			organizationId: "9a25799e-22e3-4f6b-b1e",
		// 		},
		// 		{
		// 			...createServiceOrganizationMock({
		// 				organizationId: baseOrganization.id,
		// 				serviceId: baseService.id,
		// 			}),
		// 			serviceId: "9a25799e-22e3-4f6b-b1e",
		// 		},
		// 		{
		// 			...createServiceOrganizationMock({
		// 				organizationId: baseOrganization.id,
		// 				serviceId: baseService.id,
		// 			}),
		// 			status: "ENUM",
		// 		},
		// 		{
		// 			...createServiceOrganizationMock({
		// 				organizationId: baseOrganization.id,
		// 				serviceId: baseService.id,
		// 			}),
		// 			startDate: "TEST",
		// 		},
		// 		{
		// 			...createServiceOrganizationMock({
		// 				organizationId: baseOrganization.id,
		// 				serviceId: baseService.id,
		// 			}),
		// 			endDate: "TEST",
		// 		},
		// 		{
		// 			...createServiceOrganizationMock({
		// 				organizationId: baseOrganization.id,
		// 				serviceId: baseService.id,
		// 			}),
		// 			comment: 5665,
		// 		},
		// 	];

		// 	for await (const createServiceDto of values) {
		// 		const response = await apiCall.post(route, createServiceDto);
		// 		expect(response.status).toBe(400);
		// 	}
		// });
	});

	describe("UPDATE SERVICE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a service-organization", async () => {
			const serviceOrganization = await addServiceOrganizationToDB({
				nestApp,
				organization: baseOrganization,
				service: baseService,
			});

			const updateServiceOrganizationDto: UpdateServiceOrganizationDto = updateServiceOrganizationMock({});

			const updated = await apiCall.put<UpdateServiceOrganizationDto>(
				route,
				serviceOrganization.id,
				updateServiceOrganizationDto,
			);
			const {
				id,
				organization,
				service,
				startDate,
				status,
				comment,
				dateExport,
				endDate,
				hosting,
				prices,
				workflowProgress,
			} = await getServiceOrganizationFromDB({ nestApp, id: serviceOrganization.id });

			expect(updated.status).toBe(200);

			expect(id).toBeDefined();
			expect(organization).toBeDefined();
			expect(service).toBeDefined();
			expect(new Date(startDate).toLocaleDateString()).toEqual(
				updateServiceOrganizationDto.startDate.toLocaleDateString(),
			);
			expect(status).toEqual(updateServiceOrganizationDto.status);
			expect(comment).toEqual(trimAndLowercase(updateServiceOrganizationDto.comment));
			expect(dateExport).toEqual(null);
			expect(new Date(endDate).toLocaleDateString()).toEqual(
				updateServiceOrganizationDto.endDate.toLocaleDateString(),
			);
			expect(hosting).toBeDefined();
			expect(prices).toBeDefined();
			expect(workflowProgress).toBeDefined();
		});

		it("Should not set to null all optionals values of a service", async () => {
			const listExercise = await addManyExerciseToDB({ nestApp, numberOfRows: 10 });
			const serviceOrganization = await addServiceOrganizationToDB({
				nestApp,
				organization: baseOrganization,
				service: baseService,
				listExerciseId: listExercise.map((item) => item.id),
				hosting: baseListValueServ,
			});

			const updateServiceOrganizationDto: UpdateServiceOrganizationDto = {
				startDate: undefined,
				status: undefined,
				comment: undefined,
				endDate: undefined,
				hostingId: undefined,
				prices: undefined,
			};
			const updated = await apiCall.put<UpdateServiceOrganizationDto>(
				route,
				serviceOrganization.id,
				updateServiceOrganizationDto,
			);

			const {
				id,
				organization,
				service,
				startDate,
				status,
				comment,
				dateExport,
				endDate,
				hosting,
				prices,
				workflowProgress,
			} = await getServiceOrganizationFromDB({ nestApp, id: serviceOrganization.id });

			expect(updated.status).toBe(200);

			expect(id).toBeDefined();
			expect(organization).toBeDefined();
			expect(service).toBeDefined();
			expect(startDate).toBeDefined();
			expect(status).toBeDefined();
			expect(comment).toBeDefined();
			expect(dateExport).toBeDefined();
			expect(endDate).toBeDefined();
			expect(hosting).toBeDefined();
			expect(prices).toBeDefined();
			expect(workflowProgress).toBeDefined();
		});

		it("Should set to null all optionals values of a service-organization", async () => {
			const listExercise = await addManyExerciseToDB({ nestApp, numberOfRows: 10 });
			const serviceOrganization = await addServiceOrganizationToDB({
				nestApp,
				organization: baseOrganization,
				service: baseService,
				listExerciseId: listExercise.map((item) => item.id),
				hosting: baseListValueServ,
			});

			const updateServiceOrganizationDto: UpdateServiceOrganizationDto = {
				startDate: null,
				status: null,
				comment: null,
				endDate: null,
				hostingId: null,
				prices: null,
			};
			const updated = await apiCall.put<UpdateServiceOrganizationDto>(
				route,
				serviceOrganization.id,
				updateServiceOrganizationDto,
			);

			const {
				id,
				organization,
				service,
				startDate,
				status,
				comment,
				dateExport,
				endDate,
				hosting,
				prices,
				workflowProgress,
			} = await getServiceOrganizationFromDB({ nestApp, id: serviceOrganization.id });

			expect(updated.status).toBe(200);

			expect(id).toBeDefined();
			expect(organization).toBeDefined();
			expect(service).toBeDefined();
			expect(startDate).toBeDefined();
			expect(status).toBeDefined();
			expect(comment).toEqual(null);
			expect(dateExport).toBeDefined();
			expect(endDate).toEqual(null);
			expect(hosting).toEqual(null);
			expect(prices).toEqual([]);
			expect(workflowProgress).toBeDefined();
		});
	});

	describe("DELETE SERVICE-ORGANIZATION - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a serviceOrganization that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a serviceOrganization", async () => {
			const listExerciseId = await addManyExerciseToDB({ nestApp, numberOfRows: 10 });

			const serviceOrganization = await addServiceOrganizationToDB({
				nestApp,
				organization: baseOrganization,
				service: baseService,
				hosting: baseListValueServ,
				listExerciseId: listExerciseId.map((item) => item.id),
			});

			const { status } = await apiCall.delete(route, serviceOrganization.id);

			expect(status).toBe(200);
		});
	});

	describe("GET SERVICE-ORGANIZATION - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a service-organization", async () => {
			const serviceOrganization = await addServiceOrganizationToDB({
				nestApp,
				organization: baseOrganization,
				service: baseService,
			});

			const response = await apiCall.get(route, serviceOrganization.id);

			const {
				id,
				organization,
				service,
				startDate,
				status,
				comment,
				dateExport,
				endDate,
				hosting,
				prices,
				workflowProgress,
			}: IServiceOrganizationResponse = response.body;

			expect(id).toBeDefined();
			expect(organization).toBeDefined();
			expect(service).toBeDefined();
			expect(startDate).toBeDefined();
			expect(status).toBeDefined();
			expect(comment).toBeDefined();
			expect(endDate).toBeDefined();
			expect(hosting).toBeDefined();
			expect(dateExport).toBeDefined();
			expect(prices).toBeDefined();
			expect(workflowProgress).toBeDefined();
		});
	});

	describe("GET LIST SERVICE-ORGANIZATION - (/) - GET", () => {
		it("Should recover the list of service-organization by organization - (/organization/:organizationId) ", async () => {
			const [otherOrganization, listExercise] = await Promise.all([
				addOrganizationToDB({ nestApp, type: baseListValueOrg }),
				addManyExerciseToDB({ nestApp, numberOfRows: 10 }),
			]);
			await Promise.all([
				addManyServiceOrganizationToDB({
					nestApp,
					organization: baseOrganization,
					numberOfRows: 10,
					service: baseService,
					hosting: baseListValueServ,
					listExerciseId: listExercise.map((item) => item.id),
				}),
				addManyServiceOrganizationToDB({
					nestApp,
					organization: otherOrganization,
					numberOfRows: 20,
					service: baseService,
				}),
			]);

			const { status: apiStatus, body } = await apiCall.get(`${route}/organization/${baseOrganization.id}`);

			expect(apiStatus).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach(
				({
					id,
					organization,
					service,
					startDate,
					status,
					comment,
					dateExport,
					endDate,
					hosting,
					prices,
					workflowProgress,
				}: IServiceOrganizationResponse) => {
					expect(id).toBeDefined();
					expect(organization).toBeUndefined();
					expect(service).toBeDefined();
					expect(startDate).toBeDefined();
					expect(status).toBeDefined();
					expect(comment).toBeDefined();
					expect(endDate).toBeDefined();
					expect(hosting).toBeDefined();
					expect(dateExport).toBeDefined();
					expect(prices).toBeDefined();
					expect(workflowProgress).toBeDefined();
				},
			);
		});
	});
});
