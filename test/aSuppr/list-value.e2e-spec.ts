import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateListValueDto, UpdateListValueDto } from "src/modules/list-value/dto";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addListValueToDB,
	addManyListValueToDB,
	createListValueMock,
	getListValueFromDB,
	updateListValueMock,
} from "./mocks/list-value.mock";

describe("ListValueController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/list-value";
	let apiCall: ApiCall;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE LIST-VALUE - (/) - POST", () => {
		it("Should not create a list-value without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a list-value", async () => {
			const createListValueDto: CreateListValueDto = createListValueMock();

			const response = await apiCall.post<CreateListValueDto>(route, createListValueDto);
			expect(response.status).toBe(201);

			const { value, flag, isDefault }: IListValueResponse = response.body;

			expect(value).toEqual(trimAndUppercase(createListValueDto.value));
			expect(flag).toEqual(createListValueDto.flag);
			expect(isDefault).toEqual(createListValueDto.isDefault);
		});

		it("Should create a list-value with default values", async () => {
			const createListValueDto: CreateListValueDto = createListValueMock();

			const response = await apiCall.post<CreateListValueDto>(route, {
				value: createListValueDto.value,
				flag: createListValueDto.flag,
				isDefault: undefined,
				code: undefined,
			});
			expect(response.status).toBe(201);

			const { value, flag, isDefault, code }: IListValueResponse = response.body;

			expect(value).toEqual(trimAndUppercase(value));
			expect(flag).toEqual(flag);
			expect(isDefault).toEqual(false);
			expect(code).toBeNull();
		});

		it.each([
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "Test" }),
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "test" }),
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "TEST" }),
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "tesT" }),
		])("Should not create a list-value that as a duplicate value", async (createListValueDto) => {
			const duplicateValue = "Test";
			await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE, value: duplicateValue });

			const response = await apiCall.post<CreateListValueDto>(route, createListValueDto);
			expect(response.status).toBe(409);
		});

		it.each([
			{ ...createListValueMock(), value: "" },
			{ ...createListValueMock(), flag: "TEST" },
			{ ...createListValueMock(), isDefault: 65 },
		])("Should not create a list-value while receiving invalid data", async (createListValueDto) => {
			const response = await apiCall.post(route, createListValueDto);
			expect(response.status).toBe(400);
		});
	});

	describe("UPDATE LIST-VALUE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "Test" }),
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "Test" }),
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "Test" }),
			createListValueMock({ flag: EFlagListValue.ORGANIZATION_TYPE, value: "Test" }),
		])("Should not update a list-value that as a duplicate value", async (updateListValueDto) => {
			const duplicateValue = "Test";
			const [listValue] = await Promise.all([
				addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
				addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE, value: duplicateValue }),
			]);

			const response = await apiCall.put<UpdateListValueDto>(route, listValue.id, updateListValueDto);

			expect(response.status).toBe(409);
		});

		it("Should update all values of a list-value ", async () => {
			const listValue = await addListValueToDB({ nestApp });

			const updateListValueDto: UpdateListValueDto = updateListValueMock();

			const { status } = await apiCall.put<UpdateListValueDto>(route, listValue.id, updateListValueDto);
			const response = await getListValueFromDB({ nestApp, id: listValue.id });

			expect(status).toBe(200);

			expect(response.value).toEqual(trimAndUppercase(updateListValueDto.value));
			expect(response.flag).toEqual(listValue.flag);
			expect(response.isDefault).toEqual(updateListValueDto.isDefault);
			expect(response.code).toEqual(updateListValueDto.code);
		});

		it("Should not set to null all optionals values of a list-value", async () => {
			const listValue = await addListValueToDB({ nestApp });

			const { status } = await apiCall.put<UpdateListValueDto>(route, listValue.id, {});
			const response = await getListValueFromDB({ nestApp, id: listValue.id });

			expect(status).toBe(200);

			expect(response.value).toBeDefined();
			expect(response.flag).toBeDefined();
			expect(response.isDefault).toBeDefined();
			expect(response.code).toBeDefined();
		});

		it("Should set to null all optionals values of a list-value", async () => {
			const listValue = await addListValueToDB({ nestApp });

			const updateListValueDto: UpdateListValueDto = {
				value: null,
				flag: null,
				isDefault: null,
				code: null,
			};
			const { status } = await apiCall.put<UpdateListValueDto>(route, listValue.id, updateListValueDto);
			const response = await getListValueFromDB({ nestApp, id: listValue.id });

			expect(status).toBe(200);

			expect(response.value).toBeDefined();
			expect(response.flag).toBeDefined();
			expect(response.isDefault).toBeDefined();
			expect(response.code).toBeNull();
		});
	});

	describe("DELETE LIST-VALUE - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a list-value that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a list-value", async () => {
			const listValue = await addListValueToDB({ nestApp });

			const { status } = await apiCall.delete(route, listValue.id);

			expect(status).toBe(200);
		});
	});

	describe("GET LIST-VALUE - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a list-value", async () => {
			const listValue = await addListValueToDB({ nestApp });

			const response = await apiCall.get(route, listValue.id);

			const { id, value, flag, isDefault }: IListValueResponse = response.body;

			expect(id).toEqual(listValue.id);
			expect(value).toBeDefined();
			expect(flag).toBeDefined();
			expect(isDefault).toBeDefined();
		});
	});

	describe("GET LIST-VALUES - (/) - GET", () => {
		it("Should find an empty list of values", async () => {
			const { status, body } = await apiCall.get(route, "flag/unknown");

			expect(status).toBe(200);
			expect(body.length).toEqual(0);
		});

		it("Should find a list of ORGANIZATION_TYPE values", async () => {
			await Promise.all([
				addManyListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE, numberOfRows: 10 }),
				addManyListValueToDB({ nestApp, flag: EFlagListValue.ESTABLISHMENT_TYPE, numberOfRows: 10 }),
			]);

			const { status, body } = await apiCall.get(route, `flag/${EFlagListValue.ORGANIZATION_TYPE}`);

			expect(status).toBe(200);
			expect(body.length).toEqual(10);

			body.forEach((listValue: IListValueResponse) => {
				expect(listValue.value).toBeDefined();
				expect(listValue.flag).toBeDefined();
				expect(listValue.isDefault).toBeDefined();
				expect(listValue.code).toBeDefined();
			});
		});
	});
});
