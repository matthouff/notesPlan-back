import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateExternalServiceDto, UpdateExternalServiceDto } from "src/modules/external-service/dto";
import { IExternalServiceResponse } from "src/modules/external-service/entity/external-service.interface";
import { IExternalFamilyServiceResponse } from "src/modules/external-family-service/entity/external-family-service.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addExternalServiceToDB,
	addManyExternalServiceToDB,
	createExternalServiceMock,
	getExternalServiceFromDB,
	updateExternalServiceMock,
} from "./mocks/external-service.mock";
import { addExternalFamilyServiceToDB } from "./mocks/external-family-service.mock";

describe("ExternalServiceController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/external-service";
	let apiCall: ApiCall;

	let baseExternalFamilyService: IExternalFamilyServiceResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);

		baseExternalFamilyService = await addExternalFamilyServiceToDB({ nestApp });
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE EXTERNAL-SERVICE - (/) - POST", () => {
		it("Should not create a externalService without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a externalService with only the required values", async () => {
			const createExternalServiceDto: CreateExternalServiceDto = createExternalServiceMock({
				externalFamilyServiceId: baseExternalFamilyService.id,
			});

			const response = await apiCall.post<CreateExternalServiceDto>(route, {
				externalFamilyServiceId: createExternalServiceDto.externalFamilyServiceId,
				name: createExternalServiceDto.name,
			});

			expect(response.status).toBe(201);

			const { name, externalFamilyService }: IExternalServiceResponse = response.body;

			expect(externalFamilyService.id).toEqual(baseExternalFamilyService.id);
			expect(name).toEqual(trimAndUppercase(createExternalServiceDto.name));
		});

		it("Should create a externalService", async () => {
			const createExternalServiceDto: CreateExternalServiceDto = createExternalServiceMock({
				externalFamilyServiceId: baseExternalFamilyService.id,
			});

			const response = await apiCall.post<CreateExternalServiceDto>(route, createExternalServiceDto);

			expect(response.status).toBe(201);

			const { name, externalFamilyService, avatarUrl }: IExternalServiceResponse = response.body;

			expect(externalFamilyService.id).toEqual(baseExternalFamilyService.id);
			expect(name).toEqual(trimAndUppercase(createExternalServiceDto.name));
			expect(avatarUrl).toEqual(createExternalServiceDto.avatarUrl);
		});

		it("Should not create a externalService that as a duplicate name", async () => {
			const duplicateName = "Test";
			await addExternalServiceToDB({
				nestApp,
				name: duplicateName,
				externalFamilyService: baseExternalFamilyService,
			});

			const response = await apiCall.post<CreateExternalServiceDto>(route, {
				name: "test",
				externalFamilyServiceId: baseExternalFamilyService.id,
			});
			expect(response.status).toBe(409);
		});

		it("Should not create a externalService while receiving invalid data", async () => {
			[
				createExternalServiceMock({ externalFamilyServiceId: "612fa71c-5b23-46c9-b8c7-" }),
				createExternalServiceMock({ externalFamilyServiceId: baseExternalFamilyService.id, name: "" }),
				{
					...createExternalServiceMock({ externalFamilyServiceId: baseExternalFamilyService.id }),
					avatarUrl: "url",
				},
			].forEach(async (createExternalServiceDto) => {
				const response = await apiCall.post(route, createExternalServiceDto);
				expect(response.status).toBe(400);
			});
		});
	});

	describe("UPDATE EXTERNAL-SERVICE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...updateExternalServiceMock(), name: "Test" },
			{ ...updateExternalServiceMock(), name: "test" },
			{ ...updateExternalServiceMock(), name: "TEST" },
			{ ...updateExternalServiceMock(), name: "tesT" },
		])(
			"Should not update a externalService that as a duplicate value for a same externalFamilyService",
			async (updateExternalServiceDto) => {
				const duplicateName = "Test";
				await addExternalServiceToDB({
					nestApp,
					name: duplicateName,
					externalFamilyService: baseExternalFamilyService,
				});
				const externalService = await addExternalServiceToDB({
					nestApp,
					externalFamilyService: baseExternalFamilyService,
				});

				const response = await apiCall.put<UpdateExternalServiceDto>(
					route,
					externalService.id,
					updateExternalServiceDto,
				);

				expect(response.status).toBe(409);
			},
		);

		it("Should update all values of a externalService ", async () => {
			const externalService = await addExternalServiceToDB({
				nestApp,
				externalFamilyService: baseExternalFamilyService,
			});

			const updateExternalServiceDto: UpdateExternalServiceDto = updateExternalServiceMock();

			const { status } = await apiCall.put<UpdateExternalServiceDto>(
				route,
				externalService.id,
				updateExternalServiceDto,
			);
			const response = await getExternalServiceFromDB({ nestApp, id: externalService.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateExternalServiceDto.name));
		});

		it("Should not set to null all editables values of a externalService", async () => {
			const externalService = await addExternalServiceToDB({
				nestApp,
				externalFamilyService: baseExternalFamilyService,
			});

			const updateExternalServiceDto: UpdateExternalServiceDto = {
				name: undefined,
			};
			const { status } = await apiCall.put<UpdateExternalServiceDto>(
				route,
				externalService.id,
				updateExternalServiceDto,
			);
			const response = await getExternalServiceFromDB({ nestApp, id: externalService.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
		});

		it("Should set to null all editables values of a externalService", async () => {
			const externalService = await addExternalServiceToDB({
				nestApp,
				externalFamilyService: baseExternalFamilyService,
			});

			const updateExternalServiceDto: UpdateExternalServiceDto = {
				name: null,
			};
			const { status } = await apiCall.put<UpdateExternalServiceDto>(
				route,
				externalService.id,
				updateExternalServiceDto,
			);
			const response = await getExternalServiceFromDB({ nestApp, id: externalService.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
		});
	});

	describe("DELETE EXTERNAL-SERVICE - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a externalService that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a externalService", async () => {
			const externalService = await addExternalServiceToDB({
				nestApp,
				externalFamilyService: baseExternalFamilyService,
			});

			const { status } = await apiCall.delete(route, externalService.id);

			expect(status).toBe(200);
		});
	});

	describe("GET EXTERNAL-SERVICE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a externalService - (/:id)", async () => {
			const externalService = await addExternalServiceToDB({
				nestApp,
				externalFamilyService: baseExternalFamilyService,
			});

			const response = await apiCall.get(route, externalService.id);

			const {
				id,
				externalFamilyService: externalFamilyServiceFromGet,
				name,
			}: IExternalServiceResponse = response.body;

			expect(id).toEqual(externalService.id);
			expect(externalFamilyServiceFromGet).toBeDefined();
			expect(name).toBeDefined();
		});
	});

	describe("GET EXTERNAL-SERVICES - LIST", () => {
		it("Should recover the list of externalServices - (/)", async () => {
			const [otherExternalFamilyService] = await Promise.all([addExternalFamilyServiceToDB({ nestApp })]);
			await Promise.all([
				addManyExternalServiceToDB({
					nestApp,
					externalFamilyService: otherExternalFamilyService,
					numberOfRows: 20,
				}),
				addManyExternalServiceToDB({
					nestApp,
					externalFamilyService: baseExternalFamilyService,
					numberOfRows: 6,
				}),
			]);

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);

			expect(body.total).toEqual(26);
			expect(body.count).toEqual(25);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(1);
			expect(body.data.length).toEqual(25);

			body.data.forEach((externalService: IExternalServiceResponse) => {
				expect(externalService.externalFamilyService).toBeDefined();
				expect(externalService.name).toBeDefined();
				expect(externalService.avatarUrl).toBeDefined();
			});
		});

		it("Should recover the list of externalServices - (/external-family-service/:externalFamilyServiceId)", async () => {
			const [otherExternalFamilyService] = await Promise.all([addExternalFamilyServiceToDB({ nestApp })]);
			await Promise.all([
				addManyExternalServiceToDB({
					nestApp,
					externalFamilyService: otherExternalFamilyService,
					numberOfRows: 20,
				}),
				addManyExternalServiceToDB({
					nestApp,
					externalFamilyService: baseExternalFamilyService,
					numberOfRows: 5,
				}),
			]);

			const { status, body } = await apiCall.get(
				route,
				`external-family-service/${baseExternalFamilyService.id}`,
			);

			expect(status).toBe(200);

			expect(body.total).toEqual(5);
			expect(body.count).toEqual(5);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(5);

			body.data.forEach((externalService: IExternalServiceResponse) => {
				expect(externalService.externalFamilyService).toBeDefined();
				expect(externalService.name).toBeDefined();
				expect(externalService.avatarUrl).toBeDefined();
			});
		});
	});
});
