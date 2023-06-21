import { INestApplication } from "@nestjs/common";
import { trimAndUppercase } from "@asrec/misc";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { ApiCall } from "./api-call.class";
import { initializeTestApp, closeTestAppConnexion } from "./config/e2e.config";
import { CreateContactDto, UpdateContactDto } from "../src/modules/contact/dto";
import {
	addContactListToDB,
	addContactToDB,
	createContactMock,
	getContactFromDB,
	updateContactMock,
} from "./mocks/contact.mock";
import { IContactResponse } from "../src/modules/contact/entity/contact.interface";
import { Contact } from "../src/modules/contact/entity/contact.entity";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addNetworkToDB } from "./mocks/network.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addReferenceAreaToDB } from "./mocks/reference-area.mock";
import { addJobToDB } from "./mocks/job.mock";
import { addCorrespondentToDB } from "./mocks/correspondent.mock";
import { addReferentToDB } from "./mocks/referent.mock";

describe("ContactController", () => {
	let nestApp: INestApplication;
	let route = "/contact";
	let apiCall: ApiCall;

	let civilityDB: IListValueResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		civilityDB = await addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE", () => {
		it("Should not create a contact without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a contact", async () => {
			const createContactDto: CreateContactDto = createContactMock(civilityDB.id);

			const response = await apiCall.post(route, createContactDto);

			expect(response.status).toBe(201);

			const { civility, firstName, gender, lastName, email, phoneAreaCode, phoneNumber }: IContactResponse =
				response.body;

			expect(civility.id).toEqual(createContactDto.civilityId);
			expect(firstName).toEqual(trimAndUppercase(createContactDto.firstName));
			expect(lastName).toEqual(trimAndUppercase(createContactDto.lastName));
			expect(gender).toEqual(createContactDto.gender);
			expect(email).toEqual(createContactDto.email);
			expect(phoneAreaCode).toEqual(createContactDto.phoneAreaCode);
			expect(phoneNumber).toEqual(createContactDto.phoneNumber);
		});
	});

	describe("GET", () => {
		it("Should get all contacts with pagination", async () => {
			await addContactListToDB({ nestApp, civility: civilityDB, numberOfRows: 10 });

			const res = await apiCall.get(route);

			expect(res.status).toBe(200);

			const body: {
				data: Contact[];
				total: number;
				limit: number;
				offset: number;
				offsetMax: number;
				count: number;
			} = res.body;

			expect(body.total).toBe(10);
			expect(body.limit).toBeDefined();
			expect(body.offset).toBeDefined();
			expect(body.offsetMax).toBeDefined();
			expect(body.count).toBeDefined();
		});

		it("Should get a contact", async () => {
			const contact = await addContactToDB({ nestApp, civility: civilityDB });

			const res = await apiCall.get(`${route}/${contact.id}`);

			expect(res.status).toBe(200);

			const { civility, firstName, gender, id, lastName, email, phoneAreaCode, phoneNumber }: IContactResponse =
				res.body;

			expect(civility.id).toEqual(contact.civility.id);
			expect(firstName).toEqual(trimAndUppercase(contact.firstName));
			expect(lastName).toEqual(trimAndUppercase(contact.lastName));
			expect(gender).toEqual(contact.gender);
			expect(email).toEqual(contact.email);
			expect(phoneAreaCode).toEqual(contact.phoneAreaCode);
			expect(phoneNumber).toEqual(contact.phoneNumber);
			expect(id).toEqual(contact.id);
		});
	});

	describe("UPDATE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update a contact", async () => {
			const contact = await addContactToDB({ nestApp, civility: civilityDB });
			const updatedContact: UpdateContactDto = updateContactMock(civilityDB.id);
			const { status } = await apiCall.put(route, contact.id, updatedContact);

			expect(status).toBe(200);

			const { civility, firstName, lastName, id, gender, email, phoneAreaCode, phoneNumber } =
				await getContactFromDB({ nestApp, id: contact.id });

			expect(id).toEqual(contact.id);
			expect(civility.id).toEqual(updatedContact.civilityId);
			expect(firstName).toEqual(trimAndUppercase(updatedContact.firstName));
			expect(lastName).toEqual(trimAndUppercase(updatedContact.lastName));
			expect(gender).toEqual(updatedContact.gender);
			expect(email).toEqual(updatedContact.email);
			expect(phoneAreaCode).toEqual(updatedContact.phoneAreaCode);
			expect(phoneNumber).toEqual(updatedContact.phoneNumber);
		});

		it("Should set all contact's optional values to null", async () => {
			const contact = await addContactToDB({ nestApp, civility: civilityDB });

			const updateContactDto: Partial<UpdateContactDto> = {
				email: null,
				phoneAreaCode: null,
				phoneNumber: null,
				firstName: null,
				lastName: null,
			};

			const { status, body } = await apiCall.put<UpdateContactDto>(route, contact.id, updateContactDto);

			const { civility, firstName, gender, lastName, email, phoneAreaCode, phoneNumber }: IContactResponse = body;

			expect(status).toBe(200);

			expect(civility.id).toEqual(contact.civility.id);
			expect(email).toBeNull();
			expect(phoneAreaCode).toBeNull();
			expect(phoneNumber).toBeNull();
			expect(gender).toEqual(contact.gender);
			expect(firstName).toBeDefined();
			expect(lastName).toBeDefined();
		});
	});

	describe("REMOVE", () => {
		it("Should remove a contact", async () => {
			const contact = await addContactToDB({ nestApp, civility: civilityDB });

			const [networkDB, typeOrgaDB, jobDB] = await Promise.all([
				addNetworkToDB({ nestApp }),
				addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
				addJobToDB({ nestApp }),
			]);

			const [organizationDB, referenceAreaDB] = await Promise.all([
				addOrganizationToDB({ nestApp, type: typeOrgaDB }),
				addReferenceAreaToDB({ nestApp, network: networkDB }),
			]);

			// Ajout d'un correspondant et d'un referent à ce contact
			await Promise.all([
				addCorrespondentToDB({ nestApp, organization: organizationDB, job: jobDB, contact }),
				addReferentToDB({ nestApp, organization: organizationDB, referenceArea: referenceAreaDB, contact }),
			]);

			const res = await apiCall.delete(route, contact.id);

			expect(res.status).toBe(200);
		});
	});
});
