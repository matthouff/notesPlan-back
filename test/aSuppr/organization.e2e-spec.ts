import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateOrganizationDto, UpdateOrganizationDto } from "src/modules/organization/dto";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addManyOrganizationToDB,
	addOrganizationToDB,
	createOrganizationMock,
	getOrganizationFromDB,
	updateOrganizationMock,
} from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";

describe("OrganizationController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/organization";
	let apiCall: ApiCall;

	let typeDB: IListValueResponse;
	let tutelleDB: IListValueResponse;
	let dioceseDB: IListValueResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[typeDB, tutelleDB, dioceseDB] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TUTELLE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_DIOCESE }),
		]);

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE ORGANIZATION - (/) - POST", () => {
		it("Should not create a organization without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a organization with only the required values", async () => {
			const createOrganizationDto: CreateOrganizationDto = createOrganizationMock({ typeId: typeDB.id });

			const response = await apiCall.post<CreateOrganizationDto>(route, {
				name: createOrganizationDto.name,
				siret: createOrganizationDto.siret,
				typeId: createOrganizationDto.typeId,
			});

			expect(response.status).toBe(201);

			const { name, siret, type }: IOrganizationResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createOrganizationDto.name));
			expect(siret).toEqual(createOrganizationDto.siret);
			expect(type.id).toEqual(createOrganizationDto.typeId);
		});

		it("Should create a organization", async () => {
			const createOrganizationDto: CreateOrganizationDto = createOrganizationMock({
				typeId: typeDB.id,
				dioceseId: dioceseDB.id,
				tutelleId: tutelleDB.id,
			});

			const response = await apiCall.post<CreateOrganizationDto>(route, createOrganizationDto);

			expect(response.status).toBe(201);

			const {
				siret,
				name,
				type,
				tutelle,
				diocese,
				email,
				phoneAreaCode,
				phoneNumber,
				address,
				secondaryEmails,
				secondaryPhones,
			}: IOrganizationResponse = response.body;

			expect(siret).toEqual(createOrganizationDto.siret);
			expect(name).toEqual(trimAndUppercase(createOrganizationDto.name));
			expect(type.id).toEqual(createOrganizationDto.typeId);
			expect(tutelle.id).toEqual(createOrganizationDto.tutelleId);
			expect(diocese.id).toEqual(createOrganizationDto.dioceseId);
			expect(email).toEqual(createOrganizationDto.email);
			expect(phoneAreaCode).toEqual(createOrganizationDto.phoneAreaCode);
			expect(phoneNumber).toEqual(createOrganizationDto.phoneNumber);
			expect(address?.addressPart1).toEqual(trimAndUppercase(createOrganizationDto.address.addressPart1));
			expect(address?.addressPart1).toEqual(trimAndUppercase(createOrganizationDto.address.addressPart1));
			expect(address?.addressPart2).toEqual(trimAndUppercase(createOrganizationDto.address.addressPart2));
			expect(address?.addressPart3).toEqual(trimAndUppercase(createOrganizationDto.address.addressPart3));
			expect(address?.areaCode).toEqual(trimAndUppercase(createOrganizationDto.address.areaCode));
			expect(address?.city).toEqual(trimAndUppercase(createOrganizationDto.address.city));
			expect(address?.country).toEqual(trimAndUppercase(createOrganizationDto.address.country));
			expect(address?.department).toEqual(trimAndUppercase(createOrganizationDto.address.department));
			expect(secondaryEmails?.length).toEqual(createOrganizationDto.secondaryEmails.length);
			expect(secondaryPhones?.length).toEqual(createOrganizationDto.secondaryPhones.length);
		});

		it("Should create an organization with a subAgreement", async () => {
			const addedOrganizationToDB = await addOrganizationToDB({ nestApp, type: typeDB, department: "75" });

			const createOrganizationDto: CreateOrganizationDto = createOrganizationMock({
				typeId: typeDB.id,
				subAgreementId: addedOrganizationToDB.id,
			});

			const response = await apiCall.post<CreateOrganizationDto>(route, createOrganizationDto);

			expect(response.status).toBe(201);

			const { subAgreement }: IOrganizationResponse = response.body;
			expect(subAgreement.id).toEqual(addedOrganizationToDB.id);
		});
	});

	describe("UPDATE ORGANIZATION - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a organization ", async () => {
			const [organization, typeUpdate, tutelleUpdate, dioceseUpdate, subAgreementedOrganization] =
				await Promise.all([
					addOrganizationToDB({
						nestApp,
						type: typeDB,
						diocese: dioceseDB,
						tutelle: tutelleDB,
					}),
					addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
					addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TUTELLE }),
					addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_DIOCESE }),
					addOrganizationToDB({
						nestApp,
						type: typeDB,
						diocese: dioceseDB,
						tutelle: tutelleDB,
					}),
				]);

			const updateOrganizationDto: UpdateOrganizationDto = updateOrganizationMock({
				typeId: typeUpdate.id,
				dioceseId: dioceseUpdate.id,
				tutelleId: tutelleUpdate.id,
				subAgreementId: subAgreementedOrganization.id,
			});

			const { status } = await apiCall.put<UpdateOrganizationDto>(route, organization.id, updateOrganizationDto);
			const response = await getOrganizationFromDB({ nestApp, id: organization.id });

			expect(status).toBe(200);
			expect(response.name).toEqual(trimAndUppercase(updateOrganizationDto.name));
			expect(response.type.id).toEqual(updateOrganizationDto.typeId);
			expect(response.tutelle.id).toEqual(updateOrganizationDto.tutelleId);
			expect(response.diocese.id).toEqual(updateOrganizationDto.dioceseId);
			expect(response.subAgreement.id).toEqual(updateOrganizationDto.subAgreementId);
			expect(response.email).toEqual(updateOrganizationDto.email);
			expect(response.phoneAreaCode).toEqual(updateOrganizationDto.phoneAreaCode);
			expect(response.phoneNumber).toEqual(updateOrganizationDto.phoneNumber);
			expect(response.address?.addressPart1).toEqual(
				trimAndUppercase(updateOrganizationDto.address.addressPart1),
			);
			expect(response.address?.addressPart2).toEqual(
				trimAndUppercase(updateOrganizationDto.address.addressPart2),
			);
			expect(response.address?.addressPart3).toEqual(
				trimAndUppercase(updateOrganizationDto.address.addressPart3),
			);
			expect(response.address?.areaCode).toEqual(trimAndUppercase(updateOrganizationDto.address.areaCode));
			expect(response.address?.city).toEqual(trimAndUppercase(updateOrganizationDto.address.city));
			expect(response.address?.country).toEqual(trimAndUppercase(updateOrganizationDto.address.country));
			expect(response.address?.department).toEqual(trimAndUppercase(updateOrganizationDto.address.department));

			expect(response.secondaryEmails?.length).toEqual(updateOrganizationDto.secondaryEmails.length);
			expect(response.secondaryPhones?.length).toEqual(updateOrganizationDto.secondaryPhones.length);
		});

		it("Should not set to null all optionals values of an organization", async () => {
			const organization = await addOrganizationToDB({
				nestApp,
				type: typeDB,
				diocese: dioceseDB,
				tutelle: tutelleDB,
			});

			const updateOrganizationDto: UpdateOrganizationDto = {};

			const { status } = await apiCall.put<UpdateOrganizationDto>(route, organization.id, updateOrganizationDto);
			const response = await getOrganizationFromDB({ nestApp, id: organization.id });

			expect(status).toBe(200);
			expect(response.tutelle).toBeDefined();
			expect(response.diocese).toBeDefined();
			expect(response.email).toBeDefined();
			expect(response.phoneAreaCode).toBeDefined();
			expect(response.phoneNumber).toBeDefined();
			expect(response.address).toBeDefined();
			expect(response.secondaryEmails).toBeDefined();
			expect(response.secondaryPhones).toBeDefined();
		});

		it("Should set to null all optionals values of a organization", async () => {
			const organization = await addOrganizationToDB({ nestApp, type: typeDB });

			const updateOrganizationDto: UpdateOrganizationDto = {
				tutelleId: null,
				dioceseId: null,
				email: null,
				phoneAreaCode: null,
				phoneNumber: null,
				address: null,
				secondaryEmails: null,
				secondaryPhones: null,
				subAgreementId: null,
			};

			const { status } = await apiCall.put<UpdateOrganizationDto>(route, organization.id, updateOrganizationDto);
			const response = await getOrganizationFromDB({ nestApp, id: organization.id });

			expect(status).toBe(200);

			expect(response.tutelle).toBeNull();
			expect(response.diocese).toBeNull();
			expect(response.subAgreement).toBeNull();
			expect(response.email).toBeNull();
			expect(response.phoneAreaCode).toBeNull();
			expect(response.phoneNumber).toBeNull();
			expect(response.address).toBeNull();
			expect(response.secondaryEmails).toHaveLength(0);
			expect(response.secondaryPhones).toHaveLength(0);
		});
	});

	describe("DELETE ORGANIZATION - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a organization that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a organization", async () => {
			const organization = await addOrganizationToDB({ nestApp, type: typeDB });

			const { status } = await apiCall.delete(route, organization.id);

			expect(status).toBe(200);
		});
	});

	describe("GET ORGANIZATION - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a organization", async () => {
			const subAgreementedOrganization = await addOrganizationToDB({
				nestApp,
				type: typeDB,
				diocese: dioceseDB,
				tutelle: tutelleDB,
			});

			const organization = await addOrganizationToDB({
				nestApp,
				type: typeDB,
				diocese: dioceseDB,
				tutelle: tutelleDB,
				subAgreement: subAgreementedOrganization,
			});

			const { body, status } = await apiCall.get(route, organization.id);

			expect(status).toBe(200);

			expect(body.siret).toEqual(organization.siret);
			expect(body.name).toEqual(trimAndUppercase(organization.name));
			expect(body.type.id).toEqual(organization.type.id);
			expect(body.tutelle.id).toEqual(organization.tutelle.id);
			expect(body.diocese.id).toEqual(organization.diocese.id);
			expect(body.subAgreement.id).toEqual(organization.subAgreement.id);
			expect(body.email).toEqual(organization.email);
			expect(body.phoneAreaCode).toEqual(organization.phoneAreaCode);
			expect(body.phoneNumber).toEqual(organization.phoneNumber);
			expect(body.address?.addressPart1).toEqual(trimAndUppercase(organization.address.addressPart1));
			expect(body.address?.addressPart2).toEqual(trimAndUppercase(organization.address.addressPart2));
			expect(body.address?.addressPart3).toEqual(trimAndUppercase(organization.address.addressPart3));
			expect(body.address?.areaCode).toEqual(trimAndUppercase(organization.address.areaCode));
			expect(body.address?.city).toEqual(trimAndUppercase(organization.address.city));
			expect(body.address?.country).toEqual(trimAndUppercase(organization.address.country));
			expect(body.address?.department).toEqual(trimAndUppercase(organization.address.department));
			expect(body.secondaryEmails?.length).toEqual(organization.secondaryEmails.length);
			expect(body.secondaryPhones?.length).toEqual(organization.secondaryPhones.length);
		});
	});

	describe("GET ORGANIZATIONS - (/) - GET", () => {
		it("Should recover the list of organizations", async () => {
			await addManyOrganizationToDB({ nestApp, type: typeDB, numberOfRows: 10 });

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);
		});
	});
});
