import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateProviderDto, UpdateProviderDto } from "src/modules/provider/dto";
import { IProviderResponse } from "src/modules/provider/entity/provider.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addManyProviderToDB,
	addProviderToDB,
	createProviderMock,
	getProviderFromDB,
	updateProviderMock,
} from "./mocks/provider.mock";
import { addListValueToDB } from "./mocks/list-value.mock";

describe("ProviderController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/provider";
	let apiCall: ApiCall;

	let baseListValue: IListValueResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		baseListValue = await addListValueToDB({ nestApp, flag: EFlagListValue.PROVIDER_TYPE });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE PROVIDER - (/) - POST", () => {
		it("Should not create a provider without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a provider with only the required values", async () => {
			const createProviderDto: CreateProviderDto = createProviderMock({ typeId: baseListValue.id });

			const response = await apiCall.post<CreateProviderDto>(route, {
				name: createProviderDto.name,
				code: createProviderDto.code,
				typeId: baseListValue.id,
			});
			expect(response.status).toBe(201);

			const { name, code, type }: IProviderResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createProviderDto.name));
			expect(code).toEqual(trimAndUppercase(createProviderDto.code));
			expect(type.id).toEqual(createProviderDto.typeId);
		});

		it("Should create a provider", async () => {
			const createProviderDto: CreateProviderDto = createProviderMock({ typeId: baseListValue.id });

			const response = await apiCall.post<CreateProviderDto>(route, createProviderDto);
			expect(response.status).toBe(201);

			const {
				siret,
				name,
				type,
				code,
				email,
				phoneAreaCode,
				phoneNumber,
				address,
				secondaryEmails,
				secondaryPhones,
			}: IProviderResponse = response.body;

			expect(siret).toEqual(createProviderDto.siret);
			expect(name).toEqual(trimAndUppercase(createProviderDto.name));
			expect(type.id).toEqual(createProviderDto.typeId);
			expect(code).toEqual(trimAndUppercase(createProviderDto.code));
			expect(email).toEqual(createProviderDto.email);
			expect(phoneAreaCode).toEqual(createProviderDto.phoneAreaCode);
			expect(phoneNumber).toEqual(createProviderDto.phoneNumber);
			expect(address?.addressPart1).toEqual(trimAndUppercase(createProviderDto.address.addressPart1));
			expect(address?.addressPart1).toEqual(trimAndUppercase(createProviderDto.address.addressPart1));
			expect(address?.addressPart2).toEqual(trimAndUppercase(createProviderDto.address.addressPart2));
			expect(address?.addressPart3).toEqual(trimAndUppercase(createProviderDto.address.addressPart3));
			expect(address?.areaCode).toEqual(trimAndUppercase(createProviderDto.address.areaCode));
			expect(address?.city).toEqual(trimAndUppercase(createProviderDto.address.city));
			expect(address?.country).toEqual(trimAndUppercase(createProviderDto.address.country));
			expect(address?.department).toEqual(trimAndUppercase(createProviderDto.address.department));
			expect(secondaryEmails?.length).toEqual(createProviderDto.secondaryEmails.length);
			expect(secondaryPhones?.length).toEqual(createProviderDto.secondaryPhones.length);
		});

		it("Should not create a provider that as a duplicate code", async () => {
			await addProviderToDB({ nestApp, code: "Test", type: baseListValue });

			const values = [
				createProviderMock({ code: "Test", typeId: baseListValue.id }),
				createProviderMock({ code: "test", typeId: baseListValue.id }),
				createProviderMock({ code: "TEST", typeId: baseListValue.id }),
				createProviderMock({ code: "tesT", typeId: baseListValue.id }),
			];

			for await (const createProviderDto of values) {
				const response = await apiCall.post<CreateProviderDto>(route, createProviderDto);
				expect(response.status).toBe(409);
			}
		});

		it("Should not create a provider that as a duplicate name", async () => {
			await addProviderToDB({ nestApp, name: "Test", type: baseListValue });

			const values = [
				createProviderMock({ name: "Test", typeId: baseListValue.id }),
				createProviderMock({ name: "test", typeId: baseListValue.id }),
				createProviderMock({ name: "TEST", typeId: baseListValue.id }),
				createProviderMock({ name: "tesT", typeId: baseListValue.id }),
			];

			for await (const createProviderDto of values) {
				const response = await apiCall.post<CreateProviderDto>(route, createProviderDto);
				expect(response.status).toBe(409);
			}
		});

		it("Should not create a provider that as a duplicate siret", async () => {
			await addProviderToDB({ nestApp, siret: "12356894100056", type: baseListValue });

			const createProviderDto = createProviderMock({ typeId: baseListValue.id, siret: "12356894100056" });

			const response = await apiCall.post<UpdateProviderDto>(route, createProviderDto);

			expect(response.status).toBe(409);
		});

		it("Should not create a provider while receiving invalid data", async () => {
			const values = [
				{ ...createProviderMock({ typeId: baseListValue.id }), code: "" },
				{ ...createProviderMock({ typeId: baseListValue.id }), name: "" },
				{ ...createProviderMock({ typeId: baseListValue.id }), typeId: "708edbdf-48d9-4ed5-baf8-4db51e0a" },
			];

			for await (const createProviderDto of values) {
				const response = await apiCall.post(route, createProviderDto);
				expect(response.status).toBe(400);
			}
		});
	});

	describe("UPDATE PROVIDER - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should not update a provider that as a duplicate name", async () => {
			await addProviderToDB({ nestApp, name: "Test", type: baseListValue });
			const provider = await addProviderToDB({ nestApp, type: baseListValue });

			const values = [
				updateProviderMock({ name: "Test" }),
				updateProviderMock({ name: "test" }),
				updateProviderMock({ name: "TEST" }),
				updateProviderMock({ name: "tesT" }),
			];

			for await (const updateProviderDto of values) {
				const response = await apiCall.put<UpdateProviderDto>(route, provider.id, updateProviderDto);

				expect(response.status).toBe(409);
			}
		});

		it("Should not update a provider that as a duplicate siret", async () => {
			await addProviderToDB({ nestApp, siret: "12356894100056", type: baseListValue });
			const provider = await addProviderToDB({ nestApp, type: baseListValue });

			const updateProviderDto = updateProviderMock({ siret: "12356894100056" });

			const response = await apiCall.put<UpdateProviderDto>(route, provider.id, updateProviderDto);

			expect(response.status).toBe(409);
		});

		it("Should update all values of a provider", async () => {
			const [provider, otherListValue] = await Promise.all([
				addProviderToDB({ nestApp, type: baseListValue }),
				addListValueToDB({ nestApp, flag: EFlagListValue.PROVIDER_TYPE }),
			]);

			const updateProviderDto: UpdateProviderDto = updateProviderMock({ typeId: otherListValue.id });

			const { status } = await apiCall.put<UpdateProviderDto>(route, provider.id, updateProviderDto);
			const response = await getProviderFromDB({ nestApp, id: provider.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateProviderDto.name));
			expect(response.type.id).toEqual(updateProviderDto.typeId);
			expect(response.email).toEqual(updateProviderDto.email);
			expect(response.phoneAreaCode).toEqual(updateProviderDto.phoneAreaCode);
			expect(response.phoneNumber).toEqual(updateProviderDto.phoneNumber);
			expect(response.address?.addressPart1).toEqual(trimAndUppercase(updateProviderDto.address.addressPart1));
			expect(response.address?.addressPart2).toEqual(trimAndUppercase(updateProviderDto.address.addressPart2));
			expect(response.address?.addressPart3).toEqual(trimAndUppercase(updateProviderDto.address.addressPart3));
			expect(response.address?.areaCode).toEqual(trimAndUppercase(updateProviderDto.address.areaCode));
			expect(response.address?.city).toEqual(trimAndUppercase(updateProviderDto.address.city));
			expect(response.address?.country).toEqual(trimAndUppercase(updateProviderDto.address.country));
			expect(response.address?.department).toEqual(trimAndUppercase(updateProviderDto.address.department));

			expect(response.secondaryEmails?.length).toEqual(updateProviderDto.secondaryEmails.length);
			expect(response.secondaryPhones?.length).toEqual(updateProviderDto.secondaryPhones.length);
		});

		it("Should not set to null all optionals values of a provider", async () => {
			const provider = await addProviderToDB({ nestApp, type: baseListValue });

			const updateProviderDto: UpdateProviderDto = {
				name: undefined,
				siret: undefined,
				typeId: undefined,
				email: undefined,
				phoneAreaCode: undefined,
				phoneNumber: undefined,
				address: undefined,
				secondaryEmails: undefined,
				secondaryPhones: undefined,
			};
			const { status } = await apiCall.put<UpdateProviderDto>(route, provider.id, updateProviderDto);
			const response = await getProviderFromDB({ nestApp, id: provider.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.siret).toBeDefined();
			expect(response.type).toBeDefined();
			expect(response.email).toBeDefined();
			expect(response.phoneAreaCode).toBeDefined();
			expect(response.phoneNumber).toBeDefined();
			expect(response.address).toBeDefined();
			expect(response.secondaryEmails).toBeDefined();
			expect(response.secondaryPhones).toBeDefined();
		});

		it("Should not set to null all optionals values of a provider", async () => {
			const provider = await addProviderToDB({ nestApp, type: baseListValue });

			const updateProviderDto: UpdateProviderDto = {
				name: null,
				siret: null,
				typeId: null,
				email: null,
				phoneAreaCode: null,
				phoneNumber: null,
				address: null,
				secondaryEmails: null,
				secondaryPhones: null,
			};
			const { status } = await apiCall.put<UpdateProviderDto>(route, provider.id, updateProviderDto);
			const response = await getProviderFromDB({ nestApp, id: provider.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.type).toBeDefined();
			expect(response.siret).toEqual(null);
			expect(response.email).toEqual(null);
			expect(response.phoneAreaCode).toEqual(null);
			expect(response.phoneNumber).toEqual(null);
			expect(response.address).toEqual(null);
			expect(response.secondaryEmails).toEqual([]);
			expect(response.secondaryPhones).toEqual([]);
		});
	});

	describe("DELETE PROVIDER - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a provider that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a provider", async () => {
			const provider = await addProviderToDB({ nestApp, type: baseListValue });

			const { status } = await apiCall.delete(route, provider.id);

			expect(status).toBe(200);
		});
	});

	describe("GET PROVIDER - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a provider", async () => {
			const provider = await addProviderToDB({ nestApp, type: baseListValue });

			const { status, body } = await apiCall.get(route, provider.id);

			expect(status).toBe(200);

			expect(body.id).toEqual(provider.id);
			expect(body.name).toBeDefined();
			expect(body.siret).toBeDefined();
			expect(body.name).toBeDefined();
			expect(body.type.id).toBeDefined();
			expect(body.email).toBeDefined();
			expect(body.phoneAreaCode).toBeDefined();
			expect(body.phoneNumber).toBeDefined();
			expect(body.address?.addressPart1).toBeDefined();
			expect(body.address?.addressPart2).toBeDefined();
			expect(body.address?.addressPart3).toBeDefined();
			expect(body.address?.areaCode).toBeDefined();
			expect(body.address?.city).toBeDefined();
			expect(body.address?.country).toBeDefined();
			expect(body.address?.department).toBeDefined();
			expect(body.secondaryEmails?.length).toBeDefined();
			expect(body.secondaryPhones?.length).toBeDefined();
		});
	});

	describe("GET PROVIDERS - (/) - GET", () => {
		it("Should find a list of providers", async () => {
			await addManyProviderToDB({ nestApp, numberOfRows: 10, type: baseListValue });

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);
			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((provider: IProviderResponse) => {
				expect(provider.id).toEqual(provider.id);
				expect(provider.name).toBeDefined();
				expect(provider.siret).toBeDefined();
				expect(provider.name).toBeDefined();
				expect(provider.type.id).toBeDefined();
				expect(provider.email).toBeDefined();
				expect(provider.phoneAreaCode).toBeDefined();
				expect(provider.phoneNumber).toBeDefined();
				expect(provider.address?.addressPart1).toBeDefined();
				expect(provider.address?.addressPart2).toBeDefined();
				expect(provider.address?.addressPart3).toBeDefined();
				expect(provider.address?.areaCode).toBeDefined();
				expect(provider.address?.city).toBeDefined();
				expect(provider.address?.country).toBeDefined();
				expect(provider.address?.department).toBeDefined();
				expect(provider.secondaryEmails?.length).toBeDefined();
				expect(provider.secondaryPhones?.length).toBeDefined();
			});
		});
	});
});
