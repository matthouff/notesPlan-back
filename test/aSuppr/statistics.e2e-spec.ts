import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateStatisticsDto, UpdateStatisticsDto } from "src/modules/statistics/dto";
import { IStatisticsResponse } from "src/modules/statistics/entity/statistics.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addManyStatisticsToDB,
	addStatisticsToDB,
	createStatisticsMock,
	getStatisticsFromDB,
	updateStatisticsMock,
} from "./mocks/statistics.mock";
import { addNetworkToDB } from "./mocks/network.mock";

describe("StatisticsController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/statistics";
	let apiCall: ApiCall;
	let networkDB: INetworkResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		networkDB = await addNetworkToDB({ nestApp });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE STATISTICS - (/) - POST", () => {
		it("Should not create a statistics without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a statistics with only the required values", async () => {
			const createStatisticsDto: CreateStatisticsDto = createStatisticsMock({
				networkId: networkDB.id,
			});

			const response = await apiCall.post<CreateStatisticsDto>(route, {
				networkId: createStatisticsDto.networkId,
				name: createStatisticsDto.name,
			});

			expect(response.status).toBe(201);

			const { name, network }: IStatisticsResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createStatisticsDto.name));
			expect(network.id).toEqual(createStatisticsDto.networkId);
		});

		it("Should create a statistics", async () => {
			const createStatisticsDto: CreateStatisticsDto = createStatisticsMock({
				networkId: networkDB.id,
			});

			const response = await apiCall.post<CreateStatisticsDto>(route, createStatisticsDto);

			expect(response.status).toBe(201);

			const { network, name, filters }: IStatisticsResponse = response.body;

			expect(network.id).toEqual(createStatisticsDto.networkId);
			expect(name).toEqual(trimAndUppercase(createStatisticsDto.name));
			expect(filters.prospect).toEqual(createStatisticsDto.filters.prospect);
			expect(filters.subAgreement).toEqual(createStatisticsDto.filters.subAgreement);
		});

		it("Should create a statistics with default values", async () => {
			const createStatisticsDto: CreateStatisticsDto = createStatisticsMock({
				networkId: networkDB.id,
			});

			const response = await apiCall.post<CreateStatisticsDto>(route, {
				...createStatisticsDto,
				filters: undefined,
			});

			expect(response.status).toBe(201);

			const { network, name, filters }: IStatisticsResponse = response.body;

			expect(network.id).toEqual(createStatisticsDto.networkId);
			expect(name).toEqual(trimAndUppercase(createStatisticsDto.name));
			expect(filters).toBeUndefined();
		});
	});

	describe("UPDATE STATISTICS - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a statistics ", async () => {
			const statistics = await addStatisticsToDB({ nestApp, network: networkDB });

			const updateStatisticsDto: UpdateStatisticsDto = updateStatisticsMock({});

			const { status } = await apiCall.put<UpdateStatisticsDto>(route, statistics.id, updateStatisticsDto);
			const response = await getStatisticsFromDB({ nestApp, id: statistics.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateStatisticsDto.name));
			expect(response.filters.prospect).toEqual(updateStatisticsDto.filters.prospect);
			expect(response.filters.subAgreement).toEqual(updateStatisticsDto.filters.subAgreement);
		});

		it("Should not set to null all optionals values of a statistics", async () => {
			const statistics = await addStatisticsToDB({ nestApp, network: networkDB });

			const updateStatisticsDto: UpdateStatisticsDto = {
				filters: undefined,
			};

			const { status } = await apiCall.put<UpdateStatisticsDto>(route, statistics.id, updateStatisticsDto);
			const response = await getStatisticsFromDB({ nestApp, id: statistics.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.filters).toBeNull();
		});
	});

	describe("DELETE STATISTICS - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a statistics that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a statistics", async () => {
			const statistics = await addStatisticsToDB({ nestApp, network: networkDB });

			const { status } = await apiCall.delete(route, statistics.id);

			expect(status).toBe(200);
		});
	});

	describe("GET STATISTICS - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a statistics", async () => {
			const statistics = await addStatisticsToDB({ nestApp, network: networkDB });

			const response = await apiCall.get(route, statistics.id);

			expect(response.status).toBe(200);
		});
	});

	describe("GET STATISTICSS - (/) - GET", () => {
		it("Should recover the list of statisticss by network (/network/:networkId)", async () => {
			const otherNetwork = await addNetworkToDB({ nestApp });
			await Promise.all([
				addManyStatisticsToDB({ nestApp, network: networkDB, numberOfRows: 10 }),
				addManyStatisticsToDB({ nestApp, network: otherNetwork, numberOfRows: 5 }),
			]);

			const { status, body } = await apiCall.get(route, `network/${networkDB.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((statistics: IStatisticsResponse) => {
				expect(statistics.network).toBeUndefined();
				expect(statistics.name).toBeDefined();
				expect(statistics.filters).toBeDefined();
			});
		});
	});
});
