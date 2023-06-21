import { trimAndLowercase, trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateReferenceAreaDto, UpdateReferenceAreaDto } from "src/modules/reference-area/dto";
import { IReferenceAreaResponse } from "src/modules/reference-area/entity/reference-area.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addReferenceAreaToDB,
	addManyReferenceAreaToDB,
	createReferenceAreaMock,
	getReferenceAreaFromDB,
	updateReferenceAreaMock,
} from "./mocks/reference-area.mock";
import { addNetworkToDB } from "./mocks/network.mock";

describe("ReferenceAreaController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/reference-area";
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

	describe("CREATE reference-area - (/) - POST", () => {
		it("Should not create a referenceArea without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a referenceArea", async () => {
			const createReferenceAreaDto: CreateReferenceAreaDto = createReferenceAreaMock({ networkId: network.id });

			const response = await apiCall.post<CreateReferenceAreaDto>(route, createReferenceAreaDto);

			expect(response.status).toBe(201);

			const { name, network: networkFromCreate }: IReferenceAreaResponse = response.body;

			expect(networkFromCreate).toBeDefined();
			expect(name).toEqual(trimAndUppercase(createReferenceAreaDto.name));
		});

		it("Should not create a referenceArea that as a duplicate name", async () => {
			const duplicateName = "Test";
			await addReferenceAreaToDB({ nestApp, name: duplicateName, network });

			const response = await apiCall.post<CreateReferenceAreaDto>(route, { name: "test", networkId: network.id });
			expect(response.status).toBe(409);
		});

		it("Should not create a referenceArea while receiving invalid data", async () => {
			[
				createReferenceAreaMock({ networkId: "612fa71c-5b23-46c9-b8c7-" }),
				createReferenceAreaMock({ networkId: network.id, name: "" }),
			].forEach(async (createReferenceAreaDto) => {
				const response = await apiCall.post(route, createReferenceAreaDto);
				expect(response.status).toBe(400);
			});
		});
	});

	describe("UPDATE reference-area - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...updateReferenceAreaMock(), name: "Test" },
			{ ...updateReferenceAreaMock(), name: "test" },
			{ ...updateReferenceAreaMock(), name: "TEST" },
			{ ...updateReferenceAreaMock(), name: "tesT" },
		])(
			"Should not update a familyService that as a duplicate value for a same network",
			async (updateFamilyServiceDto) => {
				const duplicateName = "Test";
				await addReferenceAreaToDB({ nestApp, name: duplicateName, network });
				const familyService = await addReferenceAreaToDB({ nestApp, network });

				const response = await apiCall.put<UpdateReferenceAreaDto>(
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
			await addReferenceAreaToDB({ nestApp, name: duplicateName, network: otherNetwork });
			const familyService = await addReferenceAreaToDB({ nestApp, network });

			const response = await apiCall.put<UpdateReferenceAreaDto>(route, familyService.id, {
				name: duplicateName,
			});

			expect(response.status).toBe(200);
		});

		it("Should update all values of a referenceArea ", async () => {
			const referenceArea = await addReferenceAreaToDB({ nestApp, network });

			const updateReferenceAreaDto: UpdateReferenceAreaDto = updateReferenceAreaMock();

			const { status } = await apiCall.put<UpdateReferenceAreaDto>(
				route,
				referenceArea.id,
				updateReferenceAreaDto,
			);
			const response = await getReferenceAreaFromDB({ nestApp, id: referenceArea.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateReferenceAreaDto.name));
			expect(response.color).toEqual(updateReferenceAreaDto.color);
			expect(response.comment).toEqual(trimAndLowercase(updateReferenceAreaDto.comment));
		});

		it("Should set to null all editables values of a referenceArea", async () => {
			const referenceArea = await addReferenceAreaToDB({ nestApp, network });

			const updateReferenceAreaDto: UpdateReferenceAreaDto = {
				name: null,
				color: null,
				comment: null,
			};
			const { status } = await apiCall.put<UpdateReferenceAreaDto>(
				route,
				referenceArea.id,
				updateReferenceAreaDto,
			);
			const response = await getReferenceAreaFromDB({ nestApp, id: referenceArea.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.color).toEqual(null);
			expect(response.comment).toEqual(null);
		});
	});

	describe("DELETE reference-area - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a referenceArea that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a referenceArea", async () => {
			const referenceArea = await addReferenceAreaToDB({ nestApp, network });

			const { status } = await apiCall.delete(route, referenceArea.id);

			expect(status).toBe(200);
		});
	});

	describe("GET reference-area - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a referenceArea", async () => {
			const referenceArea = await addReferenceAreaToDB({ nestApp, network });

			const response = await apiCall.get(route, referenceArea.id);

			const { id, network: networkFromGet, name }: IReferenceAreaResponse = response.body;

			expect(id).toEqual(referenceArea.id);
			expect(networkFromGet).toBeDefined();
			expect(name).toBeDefined();
		});
	});

	describe("GET reference-areaS - (/network/:networkId) - GET", () => {
		it("Should recover the list of referenceAreas", async () => {
			const [networkNumberTwo] = await Promise.all([
				addNetworkToDB({ nestApp }),
				addManyReferenceAreaToDB({ nestApp, network, numberOfRows: 10 }),
			]);
			await addManyReferenceAreaToDB({ nestApp, network: networkNumberTwo, numberOfRows: 20 });

			const { status, body } = await apiCall.get(route, `network/${network.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((referenceArea: IReferenceAreaResponse) => {
				expect(referenceArea.network).toBeUndefined();
				expect(referenceArea.name).toBeDefined();
			});
		});
	});
});
