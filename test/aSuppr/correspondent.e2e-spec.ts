import { INestApplication } from "@nestjs/common";
import { trimAndLowercase } from "@asrec/misc";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { initializeTestApp, closeTestAppConnexion } from "./config/e2e.config";
import { addContactListToDB, addContactToDB } from "./mocks/contact.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addJobToDB } from "./mocks/job.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import {
	addCorrespondentToDB,
	createCorrespondentMock,
	getCorrespondentFromDB,
	updateCorrespondentMock,
} from "./mocks/correspondent.mock";
import { CreateCorrespondentDto, UpdateCorrespondentDto } from "../src/modules/correspondent/dto";
import { ICorrespondentResponse } from "../src/modules/correspondent/entity/Correspondent.interface";
import { Correspondent } from "../src/modules/correspondent/entity/correspondent.entity";
import { IContactResponse } from "../src/modules/contact/entity/contact.interface";
import { IListValueResponse } from "../src/modules/list-value/entity/list-value.interface";
import { IOrganizationResponse } from "../src/modules/organization/entity/organization.interface";
import { IJobResponse } from "../src/modules/job/entity/job.interface";

describe("CorrespondentController", () => {
	let nestApp: INestApplication;
	let route = "/correspondent";
	let apiCall: ApiCall;

	let typeOrgaDB: IListValueResponse;
	let civilityDB: IListValueResponse;

	let contactDB: IContactResponse;
	let organizationDB: IOrganizationResponse;
	let jobDB: IJobResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[typeOrgaDB, civilityDB, jobDB] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY }),
			addJobToDB({ nestApp }),
		]);

		[contactDB, organizationDB] = await Promise.all([
			addContactToDB({ nestApp, civility: civilityDB }),
			addOrganizationToDB({ nestApp, type: typeOrgaDB }),
		]);

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

		it("Should create a correspondent", async () => {
			const createCorrespondentDto: CreateCorrespondentDto = createCorrespondentMock({
				contactId: contactDB.id,
				jobId: jobDB.id,
				organizationId: organizationDB.id,
			});

			const response = await apiCall.post<CreateCorrespondentDto>(route, createCorrespondentDto);

			expect(response.status).toBe(201);

			const {
				comment,
				email,
				phoneAreaCode,
				phoneNumber,
				endDate,
				secondaryEmails,
				secondaryPhones,
				organization,
				contact,
				job,
			}: ICorrespondentResponse = response.body;

			expect(comment).toEqual(trimAndLowercase(createCorrespondentDto.comment));
			expect(email).toEqual(createCorrespondentDto.email);
			expect(phoneAreaCode).toEqual(createCorrespondentDto.phoneAreaCode);
			expect(phoneNumber).toEqual(createCorrespondentDto.phoneNumber);
			expect(endDate).toEqual(new Date(createCorrespondentDto.endDate).toISOString());
			expect(secondaryEmails).toBeDefined();
			expect(secondaryPhones).toBeDefined();
			expect(organization.id).toEqual(createCorrespondentDto.organizationId);
			expect(contact.id).toEqual(createCorrespondentDto.contactId);
			expect(job.id).toEqual(createCorrespondentDto.jobId);
		});
	});

	describe("GET", () => {
		it("Should get all active correspondents from an organization", async () => {
			const contactsResponse = await addContactListToDB({ nestApp, civility: civilityDB, numberOfRows: 15 });

			const promises = [];
			for (let i = 0; i < contactsResponse.length; i += 1) {
				const contact = contactsResponse[i];

				promises.push(
					addCorrespondentToDB({
						nestApp,
						organization: organizationDB,
						contact,
						job: jobDB,
						numberOfRows: 3,
					}),
				);
			}

			await Promise.all(promises);

			const response = await apiCall.get(`${route}/organization`, `${organizationDB.id}?active=true`);

			expect(response.status).toBe(200);

			const {
				data,
				count,
				limit,
				offset,
				offsetMax,
				total,
			}: {
				data: Correspondent[];
				total: number;
				limit: number;
				offset: number;
				offsetMax: number;
				count: number;
			} = response.body;

			expect(total).toBeDefined();
			expect(limit).toBeDefined();
			expect(offset).toBeDefined();
			expect(offsetMax).toBeDefined();
			expect(count).toBeDefined();

			for (let i = 0; i < data.length; i += 1) {
				const element = data[i];

				expect(new Date(element.endDate).getTime()).toBeGreaterThan(new Date().getTime());
			}
		});

		it("Should get all correspondents from an organization", async () => {
			const contactsResponse = await addContactListToDB({ nestApp, civility: civilityDB, numberOfRows: 15 });

			const promises = [];
			for (let i = 0; i < contactsResponse.length; i += 1) {
				const contact = contactsResponse[i];

				promises.push(
					addCorrespondentToDB({
						nestApp,
						organization: organizationDB,
						contact,
						job: jobDB,
						numberOfRows: 3,
					}),
				);
			}

			await Promise.all(promises);

			const response = await apiCall.get(`${route}/organization`, `${organizationDB.id}?active=false`);

			expect(response.status).toBe(200);

			const {
				count,
				limit,
				offset,
				offsetMax,
				total,
			}: {
				data: Correspondent[];
				total: number;
				limit: number;
				offset: number;
				offsetMax: number;
				count: number;
			} = response.body;

			expect(total).toBeDefined();
			expect(limit).toBeDefined();
			expect(offset).toBeDefined();
			expect(offsetMax).toBeDefined();
			expect(count).toBeDefined();
		});
	});

	describe("UPDATE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update a correspondent", async () => {
			const correspondent = await addCorrespondentToDB({
				nestApp,
				organization: organizationDB,
				contact: contactDB,
				job: jobDB,
			});

			const newJob = await addJobToDB({ nestApp });

			const updateCorrespondentDto: UpdateCorrespondentDto = updateCorrespondentMock({
				jobId: newJob.id,
			});

			const { status } = await apiCall.put(route, correspondent.id, updateCorrespondentDto);

			expect(status).toBe(200);

			const { comment, email, endDate, phoneAreaCode, phoneNumber, secondaryEmails, secondaryPhones, job } =
				await getCorrespondentFromDB({ nestApp, id: correspondent.id });

			expect(comment).toEqual(trimAndLowercase(updateCorrespondentDto.comment));
			expect(email).toEqual(updateCorrespondentDto.email);
			expect(endDate.toDateString()).toEqual(updateCorrespondentDto.endDate.toDateString());
			expect(phoneAreaCode).toEqual(updateCorrespondentDto.phoneAreaCode);
			expect(phoneNumber).toEqual(updateCorrespondentDto.phoneNumber);
			expect(secondaryEmails).toBeDefined();
			expect(secondaryPhones).toBeDefined();
			expect(job.id).toEqual(updateCorrespondentDto.jobId);
		});

		it("Should set all correspondent's optional values to null", async () => {
			const correspondent = await addCorrespondentToDB({
				nestApp,
				organization: organizationDB,
				contact: contactDB,
				job: jobDB,
			});

			const newJob = await addJobToDB({ nestApp });

			const updateCorrespondentDto: UpdateCorrespondentDto = {
				jobId: newJob.id,
				comment: null,
				email: null,
				endDate: null,
				phoneAreaCode: null,
				phoneNumber: null,
				secondaryEmails: null,
				secondaryPhones: null,
			};

			const { status } = await apiCall.put<UpdateCorrespondentDto>(
				route,
				correspondent.id,
				updateCorrespondentDto,
			);

			const { job, comment, email, phoneAreaCode, phoneNumber, secondaryEmails, secondaryPhones } =
				await getCorrespondentFromDB({ nestApp, id: correspondent.id });

			expect(status).toBe(200);

			expect(comment).toBeNull();
			expect(email).toBeNull();
			expect(phoneAreaCode).toBeNull();
			expect(phoneNumber).toBeNull();
			expect(secondaryEmails.length).toBe(0);
			expect(secondaryPhones.length).toBe(0);
			expect(job.id).toEqual(updateCorrespondentDto.jobId);
		});
	});

	describe("DELETE", () => {
		it("Should delete a correspondent", async () => {
			const [contactResponse, organizationResponse, jobResponse] = await Promise.all([
				addContactToDB({ nestApp, civility: civilityDB }),
				addOrganizationToDB({ nestApp, type: typeOrgaDB }),
				addJobToDB({ nestApp }),
			]);

			const correspondent = await addCorrespondentToDB({
				nestApp,
				organization: organizationResponse,
				contact: contactResponse,
				job: jobResponse,
			});

			const response = await apiCall.delete(route, correspondent.id);

			expect(response.status).toBe(200);
		});
	});
});
