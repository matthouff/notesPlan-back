import { INestApplication } from "@nestjs/common";
import { CreateMemberDto, UpdateMemberDto } from "src/modules/member/dto";
import { IMemberResponse } from "src/modules/member/entity/member.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { IUserResponse } from "src/modules/user/entity/user.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addManyMemberToDB,
	addMemberToDB,
	createMemberMock,
	getMemberFromDB,
	updateMemberMock,
} from "./mocks/member.mock";
import { addNetworkToDB } from "./mocks/network.mock";
import { addUserToDB } from "./mocks/user.mock";

describe("MemberController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/member";
	let apiCall: ApiCall;

	let networkDB: INetworkResponse;
	let userDB: IUserResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		networkDB = await addNetworkToDB({ nestApp });
		userDB = await addUserToDB({ nestApp });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE MEMBER - (/) - POST", () => {
		it("Should not create a member without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a member with only the required values", async () => {
			const createMemberDto: CreateMemberDto = createMemberMock({ networkId: networkDB.id, userId: userDB.id });

			const response = await apiCall.post<CreateMemberDto>(route, {
				userId: createMemberDto.userId,
				networkId: createMemberDto.networkId,
			});

			expect(response.status).toBe(201);

			const { user, network }: IMemberResponse = response.body;

			expect(user.id).toEqual(createMemberDto.userId);
			expect(network.id).toEqual(createMemberDto.networkId);
		});

		it("Should create a member", async () => {
			const createMemberDto: CreateMemberDto = createMemberMock({ networkId: networkDB.id, userId: userDB.id });

			const response = await apiCall.post<CreateMemberDto>(route, createMemberDto);

			expect(response.status).toBe(201);

			const { user, network, guest, enabled }: IMemberResponse = response.body;

			expect(user.id).toEqual(createMemberDto.userId);
			expect(network.id).toEqual(createMemberDto.networkId);
			expect(guest).toEqual(createMemberDto.guest);
			expect(enabled).toEqual(createMemberDto.enabled);
		});

		it("Should create a member with default values", async () => {
			const createMemberDto: CreateMemberDto = createMemberMock({ networkId: networkDB.id, userId: userDB.id });

			const response = await apiCall.post<CreateMemberDto>(route, {
				...createMemberDto,
				guest: undefined,
				enabled: undefined,
			});

			expect(response.status).toBe(201);

			const { user, network, guest, enabled }: IMemberResponse = response.body;

			expect(user.id).toEqual(createMemberDto.userId);
			expect(network.id).toEqual(createMemberDto.networkId);
			expect(guest).toEqual(false);
			expect(enabled).toEqual(true);
		});

		// it("Should not create a member while receiving invalid data", async () => {
		// 	[
		// 		{ ...createMemberMock({ networkId: networkDB.id }), email: "email" },
		// 		{ ...createMemberMock({ networkId: networkDB.id }), networkId: "1f38dcbb-010e-42c3-a343-" },
		// 		{ ...createMemberMock({ networkId: networkDB.id }), enabled: "false" },
		// 		{ ...createMemberMock({ networkId: networkDB.id }), guest: "false" },
		// 	].forEach(async (createMemberDto) => {
		// 		const response = await apiCall.post(route, createMemberDto);
		// 		expect(response.status).toBe(400);
		// 	});
		// });
	});

	describe("UPDATE MEMBER - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a member ", async () => {
			const member = await addMemberToDB({ nestApp, network: networkDB, user: userDB });

			const updateMemberDto: UpdateMemberDto = updateMemberMock();

			const { status } = await apiCall.put<UpdateMemberDto>(route, member.id, updateMemberDto);
			const response = await getMemberFromDB({ nestApp, id: member.id });

			expect(status).toBe(200);

			expect(response.guest).toEqual(updateMemberDto.guest);
			expect(response.enabled).toEqual(updateMemberDto.enabled);
		});

		it("Should not set to null all optionals values of a member", async () => {
			const member = await addMemberToDB({ nestApp, network: networkDB, user: userDB });

			const updateMemberDto: UpdateMemberDto = {
				enabled: undefined,
				guest: undefined,
			};

			const { status } = await apiCall.put<UpdateMemberDto>(route, member.id, updateMemberDto);
			const response = await getMemberFromDB({ nestApp, id: member.id });

			expect(status).toBe(200);

			expect(response.guest).toBeDefined();
			expect(response.enabled).toBeDefined();
		});
	});

	describe("DELETE MEMBER - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a member that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a member", async () => {
			const member = await addMemberToDB({ nestApp, network: networkDB, user: userDB });

			const { status } = await apiCall.delete(route, member.id);

			expect(status).toBe(200);
		});
	});

	describe("GET MEMBER - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a member", async () => {
			const member = await addMemberToDB({ nestApp, network: networkDB, user: userDB });

			const response = await apiCall.get(route, member.id);

			const { id, user, network, guest, enabled }: IMemberResponse = response.body;

			expect(id).toEqual(member.id);
			expect(user).toBeDefined();
			expect(network).toBeDefined();
			expect(guest).toBeDefined();
			expect(enabled).toBeDefined();
		});
	});

	describe("GET MEMBERS - (/) - GET", () => {
		it("Should recover the list of members by network (/network/:networkId)", async () => {
			const otherNetwork = await addNetworkToDB({ nestApp });
			await Promise.all([
				addManyMemberToDB({ nestApp, network: networkDB, user: userDB, numberOfRows: 10 }),
				addManyMemberToDB({ nestApp, network: otherNetwork, user: userDB, numberOfRows: 20 }),
			]);

			const { status, body } = await apiCall.get(route, `network/${networkDB.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((member: IMemberResponse) => {
				expect(member.user).toBeDefined();
				expect(member.network.id).toEqual(networkDB.id);
				expect(member.guest).toBeDefined();
				expect(member.enabled).toBeDefined();
			});
		});

		it("Should recover the list of members by user (/user/:idUser)", async () => {
			const otherUser = await addUserToDB({ nestApp });
			await Promise.all([
				addManyMemberToDB({ nestApp, network: networkDB, user: userDB, numberOfRows: 10 }),
				addManyMemberToDB({ nestApp, network: networkDB, user: otherUser, numberOfRows: 20 }),
			]);

			const { status, body } = await apiCall.get(route, `user/${userDB.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((member: IMemberResponse) => {
				expect(member.user.id).toEqual(userDB.id);
				expect(member.network).toBeDefined();
				expect(member.guest).toBeDefined();
				expect(member.enabled).toBeDefined();
			});
		});
	});
});
