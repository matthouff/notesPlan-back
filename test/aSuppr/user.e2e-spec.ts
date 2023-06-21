import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateUserDto, UpdateUserDto } from "src/modules/user/dto";
import { IUserResponse } from "src/modules/user/entity/user.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addNetworkToDB } from "./mocks/network.mock";
import { addMemberToDB } from "./mocks/member.mock";
import { addManyUserToDB, addUserToDB, createUserMock, getUserFromDB, updateUserMock } from "./mocks/user.mock";

describe("UserController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/user";
	let apiCall: ApiCall;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE USER - (/) - POST", () => {
		it("Should not create a user without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a user with only the required values", async () => {
			const createUserDto: CreateUserDto = createUserMock();

			const response = await apiCall.post<CreateUserDto>(route, {
				email: createUserDto.email,
				firstName: createUserDto.firstName,
				lastName: createUserDto.lastName,
			});

			expect(response.status).toBe(201);

			const { email, firstName, lastName, enabled }: IUserResponse = response.body;

			expect(email).toEqual(createUserDto.email);
			expect(firstName).toEqual(trimAndUppercase(createUserDto.firstName));
			expect(lastName).toEqual(trimAndUppercase(createUserDto.lastName));
			expect(enabled).toEqual(true);
		});

		it("Should create a user", async () => {
			const createUserDto: CreateUserDto = createUserMock();

			const response = await apiCall.post<CreateUserDto>(route, createUserDto);

			expect(response.status).toBe(201);

			const { email, firstName, lastName, enabled }: IUserResponse = response.body;

			expect(email).toEqual(createUserDto.email);
			expect(firstName).toEqual(trimAndUppercase(createUserDto.firstName));
			expect(lastName).toEqual(trimAndUppercase(createUserDto.lastName));
			expect(enabled).toEqual(createUserDto.enabled);
		});

		it.each([
			createUserMock({ email: "Test@gmaiL.com" }),
			createUserMock({ email: "test@gmail.com" }),
			createUserMock({ email: "TEST@GMAIL.COM" }),
		])("Should not create a user that as a duplicate email", async (createUserDto) => {
			const duplicateEmail = "teSt@gmail.Com";
			await addUserToDB({ nestApp, email: duplicateEmail });

			const response = await apiCall.post<CreateUserDto>(route, createUserDto);
			expect(response.status).toBe(409);
		});

		it.each([
			{ ...createUserMock(), email: "email" },
			{ ...createUserMock(), firstName: "" },
			{ ...createUserMock(), lastName: "" },
			{ ...createUserMock(), enabled: "false" },
		])("Should not create a user while receiving invalid data", async (createUserDto) => {
			const response = await apiCall.post(route, createUserDto);
			expect(response.status).toBe(400);
		});
	});

	describe("UPDATE USER - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a user ", async () => {
			const user = await addUserToDB({ nestApp });

			const updateUserDto: UpdateUserDto = updateUserMock();

			const { status } = await apiCall.put<UpdateUserDto>(route, user.id, updateUserDto);

			expect(status).toBe(200);

			const { firstName, lastName, enabled }: IUserResponse = await getUserFromDB({
				nestApp,
				id: user.id,
			});

			expect(firstName).toEqual(trimAndUppercase(updateUserDto.firstName));
			expect(lastName).toEqual(trimAndUppercase(updateUserDto.lastName));
			expect(enabled).toEqual(updateUserDto.enabled);
		});

		it("Should not set to null all optionals values of a user", async () => {
			const user = await addUserToDB({ nestApp });

			const updateUserDto: UpdateUserDto = {
				firstName: undefined,
				lastName: undefined,
				enabled: undefined,
			};
			const { status } = await apiCall.put<UpdateUserDto>(route, user.id, updateUserDto);
			const response = await getUserFromDB({ nestApp, id: user.id });

			expect(status).toBe(200);

			expect(response.firstName).toBeDefined();
			expect(response.lastName).toBeDefined();
			expect(response.enabled).toBeDefined();
		});

		it("Should set to null all optionals values of a user", async () => {
			const user = await addUserToDB({ nestApp });

			const updateUserDto: UpdateUserDto = {
				firstName: null,
				lastName: null,
				enabled: null,
			};
			const { status } = await apiCall.put<UpdateUserDto>(route, user.id, updateUserDto);
			const response = await getUserFromDB({ nestApp, id: user.id });

			expect(status).toBe(200);

			expect(response.firstName).toBeDefined();
			expect(response.lastName).toBeDefined();
			expect(response.enabled).toBeDefined();
		});
	});

	describe("DELETE USER - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a user that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a user", async () => {
			const user = await addUserToDB({ nestApp });

			const { status } = await apiCall.delete(route, user.id);

			expect(status).toBe(200);
		});

		it("Should delete a user that other entites depends on", async () => {
			const [user, network] = await Promise.all([addUserToDB({ nestApp }), addNetworkToDB({ nestApp })]);
			await addMemberToDB({ nestApp, network, user });

			const { status } = await apiCall.delete(route, user.id);

			expect(status).toBe(200);
		});
	});

	describe("GET USER - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a user", async () => {
			const user = await addUserToDB({ nestApp });

			const response = await apiCall.get(route, user.id);

			const { id, email, firstName, lastName, enabled }: IUserResponse = response.body;

			expect(id).toEqual(user.id);
			expect(email).toBeDefined();
			expect(firstName).toBeDefined();
			expect(lastName).toBeDefined();
			expect(enabled).toBeDefined();
		});
	});

	describe("GET USERS - (/) - GET", () => {
		it("Should recover the list of users", async () => {
			await addManyUserToDB({ nestApp, numberOfRows: 10 });

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((user: IUserResponse) => {
				expect(user.email).toBeDefined();
				expect(user.firstName).toBeDefined();
				expect(user.lastName).toBeDefined();
				expect(user.enabled).toBeDefined();
			});
		});
	});
});
