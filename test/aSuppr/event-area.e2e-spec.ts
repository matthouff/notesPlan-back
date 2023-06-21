import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateEventAreaDto, UpdateEventAreaDto } from "src/modules/event-area/dto";
import { IEventAreaResponse } from "src/modules/event-area/entity/event-area.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addEventAreaToDB,
	addManyEventAreaToDB,
	createEventAreaMock,
	getEventAreaFromDB,
	updateEventAreaMock,
} from "./mocks/event-area.mock";
import { addNetworkToDB } from "./mocks/network.mock";

describe("EventAreaController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/event-area";
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

	describe("CREATE EVENT-AREA - (/) - POST", () => {
		it("Should not create a eventArea without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a eventArea", async () => {
			const createEventAreaDto: CreateEventAreaDto = createEventAreaMock({ networkId: network.id });

			const response = await apiCall.post<CreateEventAreaDto>(route, createEventAreaDto);

			expect(response.status).toBe(201);

			const { name, network: networkFromCreate }: IEventAreaResponse = response.body;

			expect(networkFromCreate).toBeDefined();
			expect(name).toEqual(trimAndUppercase(createEventAreaDto.name));
		});

		it("Should not create a eventArea that as a duplicate name", async () => {
			const duplicateName = "Test";
			await addEventAreaToDB({ nestApp, name: duplicateName, network });

			const response = await apiCall.post<CreateEventAreaDto>(
				route,
				createEventAreaMock({ networkId: network.id, name: "test" }),
			);
			expect(response.status).toBe(409);
		});

		it("Should not create a eventArea while receiving invalid data", async () => {
			[
				createEventAreaMock({ networkId: "612fa71c-5b23-46c9-b8c7-" }),
				createEventAreaMock({ networkId: network.id, name: "" }),
			].forEach(async (createEventAreaDto) => {
				const response = await apiCall.post(route, createEventAreaDto);
				expect(response.status).toBe(400);
			});
		});
	});

	describe("UPDATE EVENT-AREA - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...updateEventAreaMock(), name: "Test" },
			{ ...updateEventAreaMock(), name: "test" },
			{ ...updateEventAreaMock(), name: "TEST" },
			{ ...updateEventAreaMock(), name: "tesT" },
		])("Should not update a eventArea that as a duplicate value for a same network", async (updateEventAreaDto) => {
			const duplicateName = "Test";
			await addEventAreaToDB({ nestApp, name: duplicateName, network });
			const eventArea = await addEventAreaToDB({ nestApp, network });

			const response = await apiCall.put<UpdateEventAreaDto>(route, eventArea.id, updateEventAreaDto);

			expect(response.status).toBe(409);
		});

		it("Should update a eventArea that as a same value but for a different network", async () => {
			const duplicateName = "Test";
			const otherNetwork = await addNetworkToDB({ nestApp });
			await addEventAreaToDB({ nestApp, name: duplicateName, network: otherNetwork });
			const eventArea = await addEventAreaToDB({ nestApp, network });

			const response = await apiCall.put<UpdateEventAreaDto>(route, eventArea.id, {
				name: duplicateName,
			});

			expect(response.status).toBe(200);
		});

		it("Should update all values of a eventArea ", async () => {
			const eventArea = await addEventAreaToDB({ nestApp, network });

			const updateEventAreaDto: UpdateEventAreaDto = updateEventAreaMock();

			const { status } = await apiCall.put<UpdateEventAreaDto>(route, eventArea.id, updateEventAreaDto);
			const response = await getEventAreaFromDB({ nestApp, id: eventArea.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateEventAreaDto.name));
		});

		it("Should not set to null all editables values of a eventArea", async () => {
			const eventArea = await addEventAreaToDB({ nestApp, network });

			const updateEventAreaDto: UpdateEventAreaDto = {
				name: undefined,
			};
			const { status } = await apiCall.put<UpdateEventAreaDto>(route, eventArea.id, updateEventAreaDto);
			const response = await getEventAreaFromDB({ nestApp, id: eventArea.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
		});

		it("Should set to null all editables values of a eventArea", async () => {
			const eventArea = await addEventAreaToDB({ nestApp, network });

			const updateEventAreaDto: UpdateEventAreaDto = {
				name: null,
			};
			const { status } = await apiCall.put<UpdateEventAreaDto>(route, eventArea.id, updateEventAreaDto);
			const response = await getEventAreaFromDB({ nestApp, id: eventArea.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
		});
	});

	describe("DELETE EVENT-AREA - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a eventArea that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a eventArea", async () => {
			const eventArea = await addEventAreaToDB({ nestApp, network });

			const { status } = await apiCall.delete(route, eventArea.id);

			expect(status).toBe(200);
		});
	});

	describe("GET EVENT-AREA - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a eventArea", async () => {
			const eventArea = await addEventAreaToDB({ nestApp, network });

			const response = await apiCall.get(route, eventArea.id);

			const { id, network: networkFromGet, name }: IEventAreaResponse = response.body;

			expect(id).toEqual(eventArea.id);
			expect(networkFromGet).toBeDefined();
			expect(name).toBeDefined();
		});
	});

	describe("GET EVENT-AREAS - (/network/:networkId) - GET", () => {
		it("Should recover the list of eventAreas", async () => {
			const [networkNumberTwo] = await Promise.all([
				addNetworkToDB({ nestApp }),
				addManyEventAreaToDB({ nestApp, network, numberOfRows: 10 }),
			]);
			await addManyEventAreaToDB({ nestApp, network: networkNumberTwo, numberOfRows: 20 });

			const { status, body } = await apiCall.get(route, `network/${network.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((eventArea: IEventAreaResponse) => {
				expect(eventArea.network).toBeUndefined();
				expect(eventArea.name).toBeDefined();
			});
		});
	});
});
