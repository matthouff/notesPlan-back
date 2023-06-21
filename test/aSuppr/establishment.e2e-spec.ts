import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateEstablishmentDto, UpdateEstablishmentDto } from "src/modules/establishment/dto";
import { IEstablishmentResponse } from "src/modules/establishment/entity/establishment.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addEstablishmentToDB,
	createEstablishmentMock,
	getEstablishmentFromDB,
	updateEstablishmentMock,
} from "./mocks/establishment.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";

describe("EstablishmentController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/establishment";
	let apiCall: ApiCall;

	let organizationDB: IOrganizationResponse;
	let typeDB: IListValueResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		const typeOrgaDB = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });

		[typeDB, organizationDB] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.ESTABLISHMENT_TYPE }),
			addOrganizationToDB({ nestApp, type: typeOrgaDB }),
		]);

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE ESTABLISHMENT - (/) - POST", () => {
		it("Should not create a establishment without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a establishment with only the required values", async () => {
			const createEstablishmentDto: CreateEstablishmentDto = createEstablishmentMock({
				organizationId: organizationDB.id,
			});

			const response = await apiCall.post<CreateEstablishmentDto>(route, {
				organizationId: createEstablishmentDto.organizationId,
				name: createEstablishmentDto.name,
				codeUAI: createEstablishmentDto.codeUAI,
			});

			expect(response.status).toBe(201);

			const { name, organization, codeUAI }: IEstablishmentResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createEstablishmentDto.name));
			expect(codeUAI).toEqual(createEstablishmentDto.codeUAI);
			expect(organization.id).toEqual(createEstablishmentDto.organizationId);
		});

		it("Should create a establishment", async () => {
			const createEstablishmentDto: CreateEstablishmentDto = createEstablishmentMock({
				organizationId: organizationDB.id,
				typeId: typeDB.id,
			});

			const response = await apiCall.post<CreateEstablishmentDto>(route, createEstablishmentDto);
			const { name, organization, codeUAI, type, address }: IEstablishmentResponse = response.body;

			expect(response.status).toBe(201);

			expect(name).toEqual(trimAndUppercase(createEstablishmentDto.name));
			expect(organization.id).toEqual(createEstablishmentDto.organizationId);
			expect(codeUAI).toEqual(createEstablishmentDto.codeUAI);
			expect(type.id).toEqual(createEstablishmentDto.typeId);

			expect(address?.addressPart1).toEqual(trimAndUppercase(createEstablishmentDto.address.addressPart1));
			expect(address?.addressPart2).toEqual(trimAndUppercase(createEstablishmentDto.address.addressPart2));
			expect(address?.addressPart3).toEqual(trimAndUppercase(createEstablishmentDto.address.addressPart3));
			expect(address?.areaCode).toEqual(createEstablishmentDto.address.areaCode);
			expect(address?.city).toEqual(trimAndUppercase(createEstablishmentDto.address.city));
			expect(address?.country).toEqual(trimAndUppercase(createEstablishmentDto.address.country));
			expect(address?.department).toEqual(trimAndUppercase(createEstablishmentDto.address.department));
		});
	});

	describe("UPDATE ESTABLISHMENT - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a establishment ", async () => {
			const [establishment, typeUpdate] = await Promise.all([
				addEstablishmentToDB({
					nestApp,
					organization: organizationDB,
					type: typeDB,
				}),
				addListValueToDB({ nestApp, flag: EFlagListValue.ESTABLISHMENT_TYPE }),
			]);

			const updateEstablishmentDto: UpdateEstablishmentDto = updateEstablishmentMock({
				typeId: typeUpdate.id,
			});

			const { status } = await apiCall.put<UpdateEstablishmentDto>(
				route,
				establishment.id,
				updateEstablishmentDto,
			);
			const response = await getEstablishmentFromDB({ nestApp, id: establishment.id });

			expect(status).toBe(200);
			expect(response.name).toEqual(trimAndUppercase(updateEstablishmentDto.name));
			expect(response.codeUAI).toEqual(updateEstablishmentDto.codeUAI);
			expect(response.type.id).toEqual(updateEstablishmentDto.typeId);

			expect(response.address?.addressPart1).toEqual(
				trimAndUppercase(updateEstablishmentDto.address.addressPart1),
			);
			expect(response.address?.addressPart2).toEqual(
				trimAndUppercase(updateEstablishmentDto.address.addressPart2),
			);
			expect(response.address?.addressPart3).toEqual(
				trimAndUppercase(updateEstablishmentDto.address.addressPart3),
			);
			expect(response.address?.areaCode).toEqual(updateEstablishmentDto.address.areaCode);
			expect(response.address?.city).toEqual(trimAndUppercase(updateEstablishmentDto.address.city));
			expect(response.address?.country).toEqual(trimAndUppercase(updateEstablishmentDto.address.country));
			expect(response.address?.department).toEqual(trimAndUppercase(updateEstablishmentDto.address.department));
		});

		it("Should not set to null all optionals values of a establishment", async () => {
			const establishment = await addEstablishmentToDB({
				nestApp,
				organization: organizationDB,
				type: typeDB,
			});

			const updateEstablishmentDto: UpdateEstablishmentDto = {};

			const { status } = await apiCall.put<UpdateEstablishmentDto>(
				route,
				establishment.id,
				updateEstablishmentDto,
			);
			const response = await getEstablishmentFromDB({ nestApp, id: establishment.id });

			expect(status).toBe(200);
			expect(response.type).toBeDefined();
			expect(response.address).toBeDefined();
		});

		it("Should set to null all optionals values of a establishment", async () => {
			const establishment = await addEstablishmentToDB({ nestApp, organization: organizationDB, type: typeDB });

			const updateEstablishmentDto: UpdateEstablishmentDto = { typeId: null, address: null };

			const { status } = await apiCall.put<UpdateEstablishmentDto>(
				route,
				establishment.id,
				updateEstablishmentDto,
			);
			const response = await getEstablishmentFromDB({ nestApp, id: establishment.id });

			expect(status).toBe(200);

			expect(response.type).toBeNull();
			expect(response.address).toBeNull();
		});
	});

	describe("DELETE ESTABLISHMENT - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a establishment that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a establishment", async () => {
			const establishment = await addEstablishmentToDB({ nestApp, organization: organizationDB, type: typeDB });

			const { status } = await apiCall.delete(route, establishment.id);

			expect(status).toBe(200);
		});
	});

	describe("GET ESTABLISHMENT - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a establishment", async () => {
			const establishment = await addEstablishmentToDB({
				nestApp,
				organization: organizationDB,
				type: typeDB,
			});

			const { body, status } = await apiCall.get(route, establishment.id);

			expect(status).toBe(200);

			expect(body.id).toEqual(establishment.id);
			expect(body.organization.id).toEqual(establishment.organization.id);
			expect(body.name).toEqual(trimAndUppercase(establishment.name));
			expect(body.codeUAI).toEqual(establishment.codeUAI);
			expect(body.name).toEqual(establishment.name);
			expect(body.type.id).toEqual(establishment.type.id);
			expect(body.address?.addressPart1).toEqual(trimAndUppercase(establishment.address.addressPart1));
			expect(body.address?.addressPart2).toEqual(trimAndUppercase(establishment.address.addressPart2));
			expect(body.address?.addressPart3).toEqual(trimAndUppercase(establishment.address.addressPart3));
			expect(body.address?.areaCode).toEqual(establishment.address.areaCode);
			expect(body.address?.city).toEqual(trimAndUppercase(establishment.address.city));
			expect(body.address?.country).toEqual(trimAndUppercase(establishment.address.country));
			expect(body.address?.department).toEqual(trimAndUppercase(establishment.address.department));
		});

		it("Should recover the list of establishments by organization", async () => {
			await addEstablishmentToDB({
				nestApp,
				organization: organizationDB,
				type: typeDB,
				numberOfRows: 10,
			});

			const { status, body } = await apiCall.get(route, `organization/${organizationDB.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((establishment: IEstablishmentResponse) => {
				expect(establishment.organization).toBeUndefined();
				expect(establishment.codeUAI).toBeDefined();
				expect(establishment.name).toBeDefined();
			});
		});
	});
});
