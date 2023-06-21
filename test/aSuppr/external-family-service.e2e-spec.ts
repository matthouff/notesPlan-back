import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import {
	CreateExternalFamilyServiceDto,
	UpdateExternalFamilyServiceDto,
} from "src/modules/external-family-service/dto";
import { IExternalFamilyServiceResponse } from "src/modules/external-family-service/entity/external-family-service.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addExternalFamilyServiceToDB,
	createExternalFamilyServiceMock,
	getExternalFamilyServiceFromDB,
	updateExternalFamilyServiceMock,
} from "./mocks/external-family-service.mock";

describe("ExternalFamilyServiceController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/external-family-service";
	let apiCall: ApiCall;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE EXTERNAL-FAMILY-SERVICE - (/) - POST", () => {
		it("Should not create a externalFamilyService without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a externalFamilyService", async () => {
			const createExternalFamilyServiceDto: CreateExternalFamilyServiceDto = createExternalFamilyServiceMock();

			const response = await apiCall.post<CreateExternalFamilyServiceDto>(route, createExternalFamilyServiceDto);

			expect(response.status).toBe(201);

			const { name }: IExternalFamilyServiceResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createExternalFamilyServiceDto.name));
		});

		it("Should not create a externalFamilyService that as a duplicate name", async () => {
			const duplicateName = "Test";
			await addExternalFamilyServiceToDB({ nestApp, name: duplicateName });

			const response = await apiCall.post<CreateExternalFamilyServiceDto>(route, {
				name: "test",
			});
			expect(response.status).toBe(409);
		});

		it("Should not create a externalFamilyService while receiving invalid data", async () => {
			const response = await apiCall.post(route, createExternalFamilyServiceMock({ name: "" }));
			expect(response.status).toBe(400);
		});
	});

	describe("UPDATE EXTERNAL-FAMILY-SERVICE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...updateExternalFamilyServiceMock(), name: "Test" },
			{ ...updateExternalFamilyServiceMock(), name: "test" },
			{ ...updateExternalFamilyServiceMock(), name: "TEST" },
			{ ...updateExternalFamilyServiceMock(), name: "tesT" },
		])(
			"Should not update a externalFamilyService that as a duplicate name",
			async (updateExternalFamilyServiceDto) => {
				const duplicateName = "Test";
				await addExternalFamilyServiceToDB({ nestApp, name: duplicateName });
				const externalFamilyService = await addExternalFamilyServiceToDB({ nestApp });

				const response = await apiCall.put<UpdateExternalFamilyServiceDto>(
					route,
					externalFamilyService.id,
					updateExternalFamilyServiceDto,
				);

				expect(response.status).toBe(409);
			},
		);

		it("Should update all values of a externalFamilyService ", async () => {
			const externalFamilyService = await addExternalFamilyServiceToDB({ nestApp });

			const updateExternalFamilyServiceDto: UpdateExternalFamilyServiceDto = updateExternalFamilyServiceMock();

			const { status } = await apiCall.put<UpdateExternalFamilyServiceDto>(
				route,
				externalFamilyService.id,
				updateExternalFamilyServiceDto,
			);
			const response = await getExternalFamilyServiceFromDB({ nestApp, id: externalFamilyService.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateExternalFamilyServiceDto.name));
		});

		it("Should set to null all editables values of a externalFamilyService", async () => {
			const externalFamilyService = await addExternalFamilyServiceToDB({ nestApp });

			const updateExternalFamilyServiceDto: UpdateExternalFamilyServiceDto = {
				name: null,
			};
			const { status } = await apiCall.put<UpdateExternalFamilyServiceDto>(
				route,
				externalFamilyService.id,
				updateExternalFamilyServiceDto,
			);
			const response = await getExternalFamilyServiceFromDB({ nestApp, id: externalFamilyService.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
		});
	});

	describe("DELETE EXTERNAL-FAMILY-SERVICE - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a externalFamilyService that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a externalFamilyService", async () => {
			const externalFamilyService = await addExternalFamilyServiceToDB({ nestApp });

			const { status } = await apiCall.delete(route, externalFamilyService.id);

			expect(status).toBe(200);
		});
	});

	describe("GET EXTERNAL-FAMILY-SERVICE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a externalFamilyService - (/:id)", async () => {
			const externalFamilyService = await addExternalFamilyServiceToDB({ nestApp });

			const response = await apiCall.get(route, externalFamilyService.id);

			const { id, name }: IExternalFamilyServiceResponse = response.body;

			expect(id).toEqual(externalFamilyService.id);
			expect(name).toBeDefined();
		});
	});

	describe("GET EXTERNAL-FAMILY-SERVICES", () => {
		it("Should recover the list of externalFamilyServices", async () => {
			await Promise.all([
				addExternalFamilyServiceToDB({ nestApp, name: "Restauration" }),
				addExternalFamilyServiceToDB({ nestApp, name: "Autre" }),
			]);

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);

			expect(body.total).toEqual(2);
			expect(body.count).toEqual(2);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(2);

			body.data.forEach((externalFamilyService: IExternalFamilyServiceResponse) => {
				expect(externalFamilyService.name).toBeDefined();
			});
		});
	});
});
