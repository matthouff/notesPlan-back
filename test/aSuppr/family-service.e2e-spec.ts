import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateFamilyServiceDto, UpdateFamilyServiceDto } from "src/modules/family-service/dto";
import { IFamilyServiceResponse } from "src/modules/family-service/entity/family-service.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addFamilyServiceToDB,
	addManyFamilyServiceToDB,
	createFamilyServiceMock,
	getFamilyServiceFromDB,
	updateFamilyServiceMock,
} from "./mocks/family-service.mock";
import { addNetworkToDB } from "./mocks/network.mock";
import { addManyServiceToDB } from "./mocks/service.mock";

describe("FamilyServiceController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/family-service";
	let apiCall: ApiCall;

	let network: INetworkResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);

		network = await addNetworkToDB({ nestApp });
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE FAMILY-SERVICE - (/) - POST", () => {
		it("Should not create a familyService without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a familyService", async () => {
			const createFamilyServiceDto: CreateFamilyServiceDto = createFamilyServiceMock({ networkId: network.id });

			const response = await apiCall.post<CreateFamilyServiceDto>(route, createFamilyServiceDto);

			expect(response.status).toBe(201);

			const { name, network: networkFromCreate }: IFamilyServiceResponse = response.body;

			expect(networkFromCreate).toBeDefined();
			expect(name).toEqual(trimAndUppercase(createFamilyServiceDto.name));
		});

		it("Should not create a familyService that as a duplicate name", async () => {
			const duplicateName = "Test";
			await addFamilyServiceToDB({ nestApp, name: duplicateName, network });

			const response = await apiCall.post<CreateFamilyServiceDto>(route, { name: "test", networkId: network.id });
			expect(response.status).toBe(409);
		});

		it("Should not create a familyService while receiving invalid data", async () => {
			[
				createFamilyServiceMock({ networkId: "612fa71c-5b23-46c9-b8c7-" }),
				createFamilyServiceMock({ networkId: network.id, name: "" }),
			].forEach(async (createFamilyServiceDto) => {
				const response = await apiCall.post(route, createFamilyServiceDto);
				expect(response.status).toBe(400);
			});
		});
	});

	describe("UPDATE FAMILY-SERVICE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...updateFamilyServiceMock(), name: "Test" },
			{ ...updateFamilyServiceMock(), name: "test" },
			{ ...updateFamilyServiceMock(), name: "TEST" },
			{ ...updateFamilyServiceMock(), name: "tesT" },
		])(
			"Should not update a familyService that as a duplicate value for a same network",
			async (updateFamilyServiceDto) => {
				const duplicateName = "Test";
				await addFamilyServiceToDB({ nestApp, name: duplicateName, network });
				const familyService = await addFamilyServiceToDB({ nestApp, network });

				const response = await apiCall.put<UpdateFamilyServiceDto>(
					route,
					familyService.id,
					updateFamilyServiceDto,
				);

				expect(response.status).toBe(409);
			},
		);

		it("Should update a familyService that as a same value but for a different network", async () => {
			const duplicateName = "Test";
			const otherNetwork = await addNetworkToDB({ nestApp });
			await addFamilyServiceToDB({ nestApp, name: duplicateName, network: otherNetwork });
			const familyService = await addFamilyServiceToDB({ nestApp, network });

			const response = await apiCall.put<UpdateFamilyServiceDto>(route, familyService.id, {
				name: duplicateName,
			});

			expect(response.status).toBe(200);
		});

		it("Should update all values of a familyService ", async () => {
			const familyService = await addFamilyServiceToDB({ nestApp, network });

			const updateFamilyServiceDto: UpdateFamilyServiceDto = updateFamilyServiceMock();

			const { status } = await apiCall.put<UpdateFamilyServiceDto>(
				route,
				familyService.id,
				updateFamilyServiceDto,
			);
			const response = await getFamilyServiceFromDB({ nestApp, id: familyService.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateFamilyServiceDto.name));
		});

		it("Should not set to null all editables values of a familyService", async () => {
			const familyService = await addFamilyServiceToDB({ nestApp, network });

			const updateFamilyServiceDto: UpdateFamilyServiceDto = {
				name: undefined,
			};
			const { status } = await apiCall.put<UpdateFamilyServiceDto>(
				route,
				familyService.id,
				updateFamilyServiceDto,
			);
			const response = await getFamilyServiceFromDB({ nestApp, id: familyService.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
		});

		it("Should set to null all editables values of a familyService", async () => {
			const familyService = await addFamilyServiceToDB({ nestApp, network });

			const updateFamilyServiceDto: UpdateFamilyServiceDto = {
				name: null,
			};
			const { status } = await apiCall.put<UpdateFamilyServiceDto>(
				route,
				familyService.id,
				updateFamilyServiceDto,
			);
			const response = await getFamilyServiceFromDB({ nestApp, id: familyService.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
		});
	});

	describe("DELETE FAMILY-SERVICE - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a familyService that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a familyService", async () => {
			const familyService = await addFamilyServiceToDB({ nestApp, network });

			const { status } = await apiCall.delete(route, familyService.id);

			expect(status).toBe(200);
		});
	});

	describe("GET FAMILY-SERVICE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a familyService - (/:id)", async () => {
			const familyService = await addFamilyServiceToDB({ nestApp, network });

			const response = await apiCall.get(route, familyService.id);

			const { id, network: networkFromGet, name }: IFamilyServiceResponse = response.body;

			expect(id).toEqual(familyService.id);
			expect(networkFromGet).toBeDefined();
			expect(name).toBeDefined();
		});
	});

	describe("GET FAMILY-SERVICES - (/network/:networkId)", () => {
		it("Should recover the list of familyServices", async () => {
			const [otherNetwork, listFamilyService] = await Promise.all([
				addNetworkToDB({ nestApp }),
				addManyFamilyServiceToDB({ nestApp, network, numberOfRows: 1 }),
			]);
			await Promise.all([
				addManyFamilyServiceToDB({ nestApp, network: otherNetwork, numberOfRows: 20 }),
				addManyServiceToDB({ nestApp, familyService: listFamilyService[0], numberOfRows: 5 }),
			]);

			const { status, body } = await apiCall.get(route, `network/${network.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(1);
			expect(body.count).toEqual(1);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(1);

			body.data.forEach((familyService: IFamilyServiceResponse) => {
				expect(familyService.network).toBeUndefined();
				expect(familyService.name).toBeDefined();
				expect(familyService.services.length).toEqual(5);
			});
		});
	});
});
