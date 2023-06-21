import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateServiceDto, UpdateServiceDto } from "../src/modules/service/dto";
import { IServiceResponse } from "../src/modules/service/entity/service.interface";
import { INetworkResponse } from "../src/modules/network/entity/network.interface";
import { IFamilyServiceResponse } from "../src/modules/family-service/entity/family-service.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addManyServiceToDB,
	addServiceToDB,
	createServiceMock,
	getServiceFromDB,
	updateServiceMock,
} from "./mocks/service.mock";
import { addFamilyServiceToDB } from "./mocks/family-service.mock";
import { addNetworkToDB } from "./mocks/network.mock";
import { addManyExerciseToDB } from "./mocks/exercise.mock";
import { addWorkflowToDB } from "./mocks/workflow.mock";
import { IWorkflowResponse } from "../src/modules/workflow/entity/workflow.interface";
import { ETypeWorkflow } from "../src/modules/workflow/entity/type-workflow.enum";

describe("ServiceController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/service";
	let apiCall: ApiCall;

	let baseNetwork: INetworkResponse;
	let baseFamilyService: IFamilyServiceResponse;
	let workflowDB: IWorkflowResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);

		baseNetwork = await addNetworkToDB({ nestApp });
		[baseFamilyService, workflowDB] = await Promise.all([
			addFamilyServiceToDB({ nestApp, network: baseNetwork }),
			addWorkflowToDB({ nestApp, network: baseNetwork, type: ETypeWorkflow.PRESTATION }),
		]);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE SERVICE - (/) - POST", () => {
		it("Should not create a service without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a service with only required values", async () => {
			const createServiceDto: CreateServiceDto = createServiceMock({ familyServiceId: baseFamilyService.id });

			const response = await apiCall.post<CreateServiceDto>(route, {
				familyServiceId: createServiceDto.familyServiceId,
				code: createServiceDto.code,
				name: createServiceDto.name,
				billingPeriod: createServiceDto.billingPeriod,
			});

			expect(response.status).toBe(201);

			const { familyService, code, name, billingPeriod }: IServiceResponse = response.body;

			expect(familyService).toBeDefined();
			expect(code).toEqual(createServiceDto.code);
			expect(name).toEqual(trimAndUppercase(createServiceDto.name));
			expect(billingPeriod).toEqual(createServiceDto.billingPeriod);
		});

		it("Should create a service", async () => {
			const listExercise = await addManyExerciseToDB({ nestApp, numberOfRows: 10 });

			const createServiceDto: CreateServiceDto = createServiceMock({
				familyServiceId: baseFamilyService.id,
				listExerciseId: listExercise.map((item) => item.id),
				workflowId: workflowDB.id,
			});

			const response = await apiCall.post<CreateServiceDto>(route, createServiceDto);

			expect(response.status).toBe(201);

			const {
				familyService,
				code,
				name,
				billingPeriod,
				RH,
				TAF,
				analyticCodeAGATE,
				counterpart,
				invoicingModel,
				prices,
				id,
				workflow,
			}: IServiceResponse = response.body;

			expect(id).toBeDefined();
			expect(familyService).toBeDefined();
			expect(code).toEqual(createServiceDto.code);
			expect(name).toEqual(trimAndUppercase(createServiceDto.name));
			expect(billingPeriod).toEqual(createServiceDto.billingPeriod);
			expect(RH).toEqual(createServiceDto.RH);
			expect(TAF).toEqual(createServiceDto.TAF);
			expect(analyticCodeAGATE).toEqual(createServiceDto.analyticCodeAGATE);
			expect(counterpart).toEqual(createServiceDto.counterpart);
			expect(invoicingModel).toEqual(createServiceDto.invoicingModel);
			expect(prices.length).toEqual(createServiceDto.prices.length);
			expect(workflow).toBeDefined();
		});

		it("Should not create a service that as a duplicate name", async () => {
			const values = [
				createServiceMock({ name: "Test", familyServiceId: baseFamilyService.id }),
				createServiceMock({ name: "test", familyServiceId: baseFamilyService.id }),
				createServiceMock({ name: "TEST", familyServiceId: baseFamilyService.id }),
				createServiceMock({ name: "tesT", familyServiceId: baseFamilyService.id }),
			];

			for await (const createServiceDto of values) {
				const duplicateName = "Test";
				const otherFamilyService = await addFamilyServiceToDB({ nestApp, network: baseNetwork });
				await addServiceToDB({ nestApp, familyService: otherFamilyService, name: duplicateName });

				const response = await apiCall.post<CreateServiceDto>(route, createServiceDto);
				expect(response.status).toBe(409);
			}
		});

		it("Should not create a service that as a duplicate code", async () => {
			const values = [
				createServiceMock({ code: "Test", familyServiceId: baseFamilyService.id }),
				createServiceMock({ code: "test", familyServiceId: baseFamilyService.id }),
				createServiceMock({ code: "TEST", familyServiceId: baseFamilyService.id }),
				createServiceMock({ code: "tesT", familyServiceId: baseFamilyService.id }),
			];

			for await (const createServiceDto of values) {
				const duplicateCode = "Test";
				const otherFamilyService = await addFamilyServiceToDB({ nestApp, network: baseNetwork });
				await addServiceToDB({ nestApp, familyService: otherFamilyService, code: duplicateCode });

				const response = await apiCall.post<CreateServiceDto>(route, createServiceDto);
				expect(response.status).toBe(409);
			}
		});

		it("Should not create a service while receiving invalid data", async () => {
			const values = [
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					familyServiceId: "9a25799e-22e3-4f6b-b1e",
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					code: 542,
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					name: 987,
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					billingPeriod: "ENUM",
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					prices: [{ value: 54123 }],
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					invoicingModel: "ENUM",
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					TAF: "false",
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					RH: "true",
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					counterpart: 6353,
				},
				{
					...createServiceMock({ familyServiceId: baseFamilyService.id }),
					analyticCodeAGATE: 5520,
				},
			];

			for await (const createServiceDto of values) {
				const response = await apiCall.post(route, createServiceDto);
				expect(response.status).toBe(400);
			}
		});

		it("Should not create a service that as an invalid workflow", async () => {
			const invalidWorkflow = await addWorkflowToDB({
				nestApp,
				network: baseNetwork,
				type: ETypeWorkflow.DEVIS,
			});

			const createServiceDto: CreateServiceDto = createServiceMock({
				familyServiceId: baseFamilyService.id,
				workflowId: invalidWorkflow.id,
			});

			const response = await apiCall.post<CreateServiceDto>(route, createServiceDto);
			expect(response.status).toBe(409);
		});
	});

	describe("UPDATE SERVICE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should not update a service that as a duplicate value", async () => {
			const duplicateName = "Test";
			await addServiceToDB({ nestApp, familyService: baseFamilyService, name: duplicateName });
			const service = await addServiceToDB({ nestApp, familyService: baseFamilyService });

			const values = [
				{ ...updateServiceMock({ familyServiceId: baseFamilyService.id }), name: "Test" },
				{ ...updateServiceMock({ familyServiceId: baseFamilyService.id }), name: "test" },
				{ ...updateServiceMock({ familyServiceId: baseFamilyService.id }), name: "TEST" },
				{ ...updateServiceMock({ familyServiceId: baseFamilyService.id }), name: "tesT" },
			];
			for await (const updateServiceDto of values) {
				const response = await apiCall.put<UpdateServiceDto>(route, service.id, updateServiceDto);

				expect(response.status).toBe(409);
			}
		});

		it("Should update all values of a service ", async () => {
			const [otherFamilyService, service, listExercise, otherWorkflow] = await Promise.all([
				addFamilyServiceToDB({ nestApp, network: baseNetwork }),
				addServiceToDB({ nestApp, familyService: baseFamilyService }),
				addManyExerciseToDB({ nestApp, numberOfRows: 10 }),
				addWorkflowToDB({ nestApp, network: baseNetwork, type: ETypeWorkflow.PRESTATION }),
			]);

			const updateServiceDto: UpdateServiceDto = updateServiceMock({
				familyServiceId: otherFamilyService.id,
				listExerciseId: listExercise.map((item) => item.id),
				workflowId: otherWorkflow.id,
			});

			const { status } = await apiCall.put<UpdateServiceDto>(route, service.id, updateServiceDto);
			const {
				billingPeriod,
				code,
				name,
				familyService,
				id,
				RH,
				TAF,
				analyticCodeAGATE,
				counterpart,
				invoicingModel,
				workflow,
			} = await getServiceFromDB({ nestApp, id: service.id });

			expect(status).toBe(200);

			expect(id).toEqual(service.id);
			expect(familyService.id).toEqual(otherFamilyService.id);
			expect(code).toEqual(updateServiceDto.code);
			expect(name).toEqual(trimAndUppercase(updateServiceDto.name));
			expect(billingPeriod).toEqual(updateServiceDto.billingPeriod);
			expect(RH).toEqual(updateServiceDto.RH);
			expect(TAF).toEqual(updateServiceDto.TAF);
			expect(analyticCodeAGATE).toEqual(updateServiceDto.analyticCodeAGATE);
			expect(counterpart).toEqual(updateServiceDto.counterpart);
			expect(invoicingModel).toEqual(updateServiceDto.invoicingModel);
			expect(workflow.id).toEqual(otherWorkflow.id);
		});

		it("Should not set to null all optionals values of a service", async () => {
			const service = await addServiceToDB({ nestApp, familyService: baseFamilyService });

			const updateServiceDto: UpdateServiceDto = {
				name: undefined,
				billingPeriod: undefined,
				analyticCodeAGATE: undefined,
				code: undefined,
				counterpart: undefined,
				familyServiceId: undefined,
				invoicingModel: undefined,
				prices: undefined,
			};
			const { status } = await apiCall.put<UpdateServiceDto>(route, service.id, updateServiceDto);
			const response = await getServiceFromDB({ nestApp, id: service.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.billingPeriod).toBeDefined();
			expect(response.analyticCodeAGATE).toBeDefined();
			expect(response.code).toBeDefined();
			expect(response.counterpart).toBeDefined();
			expect(response.familyService).toBeDefined();
			expect(response.invoicingModel).toBeDefined();
			expect(response.prices).toBeDefined();
		});

		it("Should set to null all optionals values of a service", async () => {
			const listExercise = await addManyExerciseToDB({ nestApp, numberOfRows: 10 });

			const service = await addServiceToDB({
				nestApp,
				familyService: baseFamilyService,
				listExerciseId: listExercise.map((item) => item.id),
			});

			const updateServiceDto: UpdateServiceDto = {
				name: null,
				billingPeriod: null,
				analyticCodeAGATE: null,
				code: null,
				counterpart: null,
				familyServiceId: null,
				invoicingModel: null,
				prices: null,
				workflowId: null,
			};
			const { status } = await apiCall.put<UpdateServiceDto>(route, service.id, updateServiceDto);
			const response = await getServiceFromDB({ nestApp, id: service.id });

			expect(status).toBe(200);

			expect(response.familyService).toBeDefined();
			expect(response.name).toBeDefined();
			expect(response.billingPeriod).toBeDefined();
			expect(response.code).toBeDefined();
			expect(response.analyticCodeAGATE).toEqual(null);
			expect(response.counterpart).toEqual(null);
			expect(response.invoicingModel).toEqual(null);
			expect(response.prices).toEqual([]);
			expect(response.workflow).toEqual(null);
		});

		it("Should not update to an invalid workflow", async () => {
			const invalidWorkflow = await addWorkflowToDB({
				nestApp,
				type: ETypeWorkflow.EVENEMENT,
				network: baseNetwork,
			});

			const service = await addServiceToDB({
				nestApp,
				familyService: baseFamilyService,
			});

			const updateServiceDto: UpdateServiceDto = {
				workflowId: invalidWorkflow.id,
			};
			const { status } = await apiCall.put<UpdateServiceDto>(route, service.id, updateServiceDto);

			expect(status).toBe(409);
		});
	});

	describe("DELETE SERVICE - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a service that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a service", async () => {
			const service = await addServiceToDB({ nestApp, familyService: baseFamilyService });

			const { status } = await apiCall.delete(route, service.id);

			expect(status).toBe(200);
		});
	});

	describe("GET SERVICE - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a service", async () => {
			const service = await addServiceToDB({ nestApp, familyService: baseFamilyService, workflow: workflowDB });

			const response = await apiCall.get(route, service.id);

			const {
				id,
				code,
				name,
				billingPeriod,
				familyService,
				RH,
				TAF,
				analyticCodeAGATE,
				counterpart,
				invoicingModel,
				prices,
				workflow,
			}: IServiceResponse = response.body;

			expect(id).toEqual(service.id);
			expect(code).toBeDefined();
			expect(name).toBeDefined();
			expect(billingPeriod).toBeDefined();
			expect(familyService).toBeDefined();
			expect(RH).toBeDefined();
			expect(TAF).toBeDefined();
			expect(analyticCodeAGATE).toBeDefined();
			expect(counterpart).toBeDefined();
			expect(invoicingModel).toBeDefined();
			expect(prices).toEqual([]);
			expect(workflow).toBeDefined();
		});
	});

	describe("GET SERVICES - (/) - GET", () => {
		it("Should recover the list of services by familyService", async () => {
			const otherFamilyService = await addFamilyServiceToDB({ nestApp, network: baseNetwork });
			await Promise.all([
				addManyServiceToDB({
					nestApp,
					familyService: baseFamilyService,
					numberOfRows: 10,
					workflow: workflowDB,
				}),
				addManyServiceToDB({
					nestApp,
					familyService: otherFamilyService,
					numberOfRows: 20,
					workflow: workflowDB,
				}),
			]);

			const { status, body } = await apiCall.get(`${route}/family-service/${baseFamilyService.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach(
				({
					code,
					name,
					billingPeriod,
					familyService,
					RH,
					TAF,
					analyticCodeAGATE,
					counterpart,
					invoicingModel,
					prices,
					workflow,
				}: IServiceResponse) => {
					expect(code).toBeDefined();
					expect(name).toBeDefined();
					expect(billingPeriod).toBeDefined();
					expect(familyService).toBeUndefined();
					expect(RH).toBeDefined();
					expect(TAF).toBeDefined();
					expect(analyticCodeAGATE).toBeDefined();
					expect(counterpart).toBeDefined();
					expect(invoicingModel).toBeDefined();
					expect(prices).toEqual([]);
					expect(workflow).toBeDefined();
				},
			);
		});

		it("Should recover the list of services by network", async () => {
			const otherNetwork = await addNetworkToDB({ nestApp });
			const otherFamilyService = await addFamilyServiceToDB({ nestApp, network: otherNetwork });
			await Promise.all([
				addManyServiceToDB({ nestApp, familyService: baseFamilyService, numberOfRows: 10 }),
				addManyServiceToDB({ nestApp, familyService: otherFamilyService, numberOfRows: 20 }),
			]);

			const { status, body } = await apiCall.get(`${route}/network/${baseNetwork.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach(
				({
					code,
					name,
					billingPeriod,
					familyService,
					RH,
					TAF,
					analyticCodeAGATE,
					counterpart,
					invoicingModel,
					prices,
				}: IServiceResponse) => {
					expect(code).toBeDefined();
					expect(name).toBeDefined();
					expect(billingPeriod).toBeDefined();
					expect(familyService).toBeDefined();
					expect(RH).toBeDefined();
					expect(TAF).toBeDefined();
					expect(analyticCodeAGATE).toBeDefined();
					expect(counterpart).toBeDefined();
					expect(invoicingModel).toBeDefined();
					expect(prices).toEqual([]);
				},
			);
		});
	});
});
