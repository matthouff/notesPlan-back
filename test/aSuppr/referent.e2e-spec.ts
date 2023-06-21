import { INestApplication } from "@nestjs/common";
import { IContactResponse } from "src/modules/contact/entity/contact.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IReferenceAreaResponse } from "src/modules/reference-area/entity/reference-area.interface";
import { CreateReferentDto, UpdateReferentDto } from "src/modules/referent/dto";
import { IReferentResponse } from "src/modules/referent/entity/referent.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addContactToDB } from "./mocks/contact.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addReferenceAreaToDB } from "./mocks/reference-area.mock";
import { addNetworkToDB } from "./mocks/network.mock";
import { addReferentToDB, createReferentMock, getReferentFromDB, updateReferentMock } from "./mocks/referent.mock";

describe("ReferentController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/referent";
	let apiCall: ApiCall;

	let typeOrgaDB: IListValueResponse;
	let civilityDB: IListValueResponse;
	let contactDB: IContactResponse;
	let networkDB: INetworkResponse;
	let organizationDB: IOrganizationResponse;
	let referenceAreaDB: IReferenceAreaResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[networkDB, typeOrgaDB, civilityDB] = await Promise.all([
			addNetworkToDB({ nestApp }),
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY }),
		]);

		[contactDB, organizationDB, referenceAreaDB] = await Promise.all([
			addContactToDB({ nestApp, civility: civilityDB }),
			addOrganizationToDB({ nestApp, type: typeOrgaDB }),
			addReferenceAreaToDB({ nestApp, network: networkDB }),
		]);

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE Referent - (/) - POST", () => {
		it("Should not create a Referent without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a Referent with only the required values", async () => {
			const createReferentDto: CreateReferentDto = createReferentMock({
				contactId: contactDB.id,
				organizationId: organizationDB.id,
				referenceAreaId: referenceAreaDB.id,
			});

			const response = await apiCall.post<CreateReferentDto>(route, {
				organizationId: createReferentDto.organizationId,
				contactId: createReferentDto.contactId,
				referenceAreaId: createReferentDto.referenceAreaId,
				startDate: createReferentDto.startDate,
			});

			expect(response.status).toBe(201);

			const { organization, contact, referenceArea, startDate }: IReferentResponse = response.body;

			expect(organization.id).toEqual(createReferentDto.organizationId);
			expect(contact.id).toEqual(createReferentDto.contactId);
			expect(referenceArea.id).toEqual(createReferentDto.referenceAreaId);
			expect(new Date(startDate).toDateString()).toEqual(createReferentDto.startDate.toDateString());
		});

		it("Should create a Referent", async () => {
			const createReferentDto: CreateReferentDto = createReferentMock({
				contactId: contactDB.id,
				organizationId: organizationDB.id,
				referenceAreaId: referenceAreaDB.id,
			});

			const response = await apiCall.post<CreateReferentDto>(route, createReferentDto);

			expect(response.status).toBe(201);

			const { organization, contact, referenceArea, startDate, endDate }: IReferentResponse = response.body;

			expect(organization.id).toEqual(createReferentDto.organizationId);
			expect(contact.id).toEqual(createReferentDto.contactId);
			expect(referenceArea.id).toEqual(createReferentDto.referenceAreaId);
			expect(startDate).toEqual(new Date(createReferentDto.startDate).toISOString());
			expect(endDate).toEqual(new Date(createReferentDto.endDate).toISOString());
		});
	});

	describe("UPDATE Referent - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a Referent ", async () => {
			const referent = await addReferentToDB({
				nestApp,
				contact: contactDB,
				organization: organizationDB,
				referenceArea: referenceAreaDB,
			});

			const updateReferentDto: UpdateReferentDto = updateReferentMock();

			const { status } = await apiCall.put<UpdateReferentDto>(route, referent.id, updateReferentDto);
			const response = await getReferentFromDB({ nestApp, id: referent.id });

			expect(status).toBe(200);
			expect(response.startDate.toDateString()).toEqual(updateReferentDto.startDate.toDateString());
			expect(response.endDate.toDateString()).toEqual(updateReferentDto.endDate.toDateString());
		});

		it("Should not set to null all optionals values of a Referent", async () => {
			const referent = await addReferentToDB({
				nestApp,
				contact: contactDB,
				organization: organizationDB,
				referenceArea: referenceAreaDB,
			});

			const updateReferentDto: UpdateReferentDto = {};

			const { status } = await apiCall.put<UpdateReferentDto>(route, referent.id, updateReferentDto);
			const response = await getReferentFromDB({ nestApp, id: referent.id });

			expect(status).toBe(200);
			expect(response.endDate).toBeDefined();
		});

		it("Should set to null all optionals values of a Referent", async () => {
			const referent = await addReferentToDB({
				nestApp,
				contact: contactDB,
				organization: organizationDB,
				referenceArea: referenceAreaDB,
			});

			const updateReferentDto: UpdateReferentDto = { endDate: null };

			const { status } = await apiCall.put<UpdateReferentDto>(route, referent.id, updateReferentDto);
			const { endDate } = await getReferentFromDB({ nestApp, id: referent.id });

			expect(status).toBe(200);

			expect(endDate).toBeNull();
		});
	});

	describe("DELETE Referent - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a Referent that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a Referent", async () => {
			const referent = await addReferentToDB({
				nestApp,
				contact: contactDB,
				organization: organizationDB,
				referenceArea: referenceAreaDB,
			});

			const { status } = await apiCall.delete(route, referent.id);

			expect(status).toBe(200);
		});
	});

	// describe("GET Referents - (/) - GET", () => {
	// 	it("Should recover the list of Referents by contact", async () => {
	// 		const listNetwork = await addManyNetworkToDB({ nestApp, numberOfRows: 2 });

	// 		const [listReferenceArea, listOrganization] = await Promise.all([
	// 			addManyReferenceAreaToDB({ nestApp, network: listNetwork[0], numberOfRows: 4 }),
	// 			addManyOrganizationToDB({ nestApp, type: typeOrgaDB, numberOfRows: 4 }),
	// 		]);

	// 		await addManyReferentToDB({
	// 			nestApp,
	// 			contact: contactDB,
	// 			organization: organizationDB,
	// 			referenceArea: referenceAreaDB,
	// 			numberOfRows: 10,
	// 		});

	// 		const { status, body } = await apiCall.get(route, `contact/${contactDB.id}`);

	// 		expect(status).toBe(200);

	// 		expect(body.total).toEqual(10);
	// 		expect(body.count).toEqual(10);
	// 		expect(body.limit).toEqual(25);
	// 		expect(body.offset).toEqual(0);
	// 		expect(body.offsetMax).toEqual(0);
	// 		expect(body.data.length).toEqual(10);

	// 		body.data.forEach((referent: IReferentResponse) => {
	// 			expect(referent.contact).toBeUndefined();
	// 			expect(referent.organization).toBeDefined();
	// 			expect(referent.referenceArea).toBeDefined();
	// 			expect(referent.endDate).toBeDefined();
	// 			expect(referent.startDate).toBeDefined();
	// 		});
	// 	});

	// 	it("Should recover the list of Referents by organization", async () => {
	// 		await addManyReferentToDB({
	// 			nestApp,
	// 			contact: contactDB,
	// 			organization: organizationDB,
	// 			referenceArea: referenceAreaDB,
	// 			numberOfRows: 10,
	// 		});

	// 		const { status, body } = await apiCall.get(route, `organization/${organizationDB.id}`);

	// 		expect(status).toBe(200);

	// 		expect(body.total).toEqual(10);
	// 		expect(body.count).toEqual(10);
	// 		expect(body.limit).toEqual(25);
	// 		expect(body.offset).toEqual(0);
	// 		expect(body.offsetMax).toEqual(0);
	// 		expect(body.data.length).toEqual(10);

	// 		body.data.forEach((referent: IReferentResponse) => {
	// 			expect(referent.organization).toBeUndefined();
	// 			expect(referent.contact).toBeDefined();
	// 			expect(referent.referenceArea).toBeDefined();
	// 			expect(referent.startDate).toBeDefined();
	// 			expect(referent.endDate).toBeDefined();
	// 		});
	// 	});
	// });
});
