import { INestApplication } from "@nestjs/common";
import { trimAndLowercase } from "@asrec/misc";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { initializeTestApp, closeTestAppConnexion } from "./config/e2e.config";
import { addContactListToDB, addContactToDB } from "./mocks/contact.mock";
import { addProviderToDB } from "./mocks/provider.mock";
import { addJobToDB } from "./mocks/job.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addEmployeeToDB, createEmployeeMock, getEmployeeFromDB, updateEmployeeMock } from "./mocks/employee.mock";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../src/modules/employee/dto";
import { IEmployeeResponse } from "../src/modules/employee/entity/Employee.interface";
import { Employee } from "../src/modules/employee/entity/employee.entity";
import { IContactResponse } from "../src/modules/contact/entity/contact.interface";
import { IListValueResponse } from "../src/modules/list-value/entity/list-value.interface";
import { IProviderResponse } from "../src/modules/provider/entity/provider.interface";
import { IJobResponse } from "../src/modules/job/entity/job.interface";

describe("EmployeeController", () => {
	let nestApp: INestApplication;
	let route = "/employee";
	let apiCall: ApiCall;

	let typeOrgaDB: IListValueResponse;
	let civilityDB: IListValueResponse;

	let contactDB: IContactResponse;
	let providerDB: IProviderResponse;
	let jobDB: IJobResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[typeOrgaDB, civilityDB, jobDB] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY }),
			addJobToDB({ nestApp }),
		]);

		[contactDB, providerDB] = await Promise.all([
			addContactToDB({ nestApp, civility: civilityDB }),
			addProviderToDB({ nestApp, type: typeOrgaDB }),
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

		it("Should create a employee", async () => {
			const createEmployeeDto: CreateEmployeeDto = createEmployeeMock({
				contactId: contactDB.id,
				jobId: jobDB.id,
				providerId: providerDB.id,
			});

			const response = await apiCall.post<CreateEmployeeDto>(route, createEmployeeDto);

			expect(response.status).toBe(201);

			const {
				comment,
				email,
				phoneAreaCode,
				phoneNumber,
				endDate,
				secondaryEmails,
				secondaryPhones,
				provider,
				contact,
				job,
			}: IEmployeeResponse = response.body;

			expect(comment).toEqual(trimAndLowercase(createEmployeeDto.comment));
			expect(email).toEqual(createEmployeeDto.email);
			expect(phoneAreaCode).toEqual(createEmployeeDto.phoneAreaCode);
			expect(phoneNumber).toEqual(createEmployeeDto.phoneNumber);
			expect(endDate).toEqual(new Date(createEmployeeDto.endDate).toISOString());
			expect(secondaryEmails).toBeDefined();
			expect(secondaryPhones).toBeDefined();
			expect(provider.id).toEqual(createEmployeeDto.providerId);
			expect(contact.id).toEqual(createEmployeeDto.contactId);
			expect(job.id).toEqual(createEmployeeDto.jobId);
		});
	});

	describe("GET", () => {
		it("Should get all active employees from an provider", async () => {
			const contactsResponse = await addContactListToDB({ nestApp, civility: civilityDB, numberOfRows: 15 });

			const promises = [];
			for (let i = 0; i < contactsResponse.length; i += 1) {
				const contact = contactsResponse[i];

				promises.push(
					addEmployeeToDB({
						nestApp,
						provider: providerDB,
						contact,
						job: jobDB,
						numberOfRows: 3,
					}),
				);
			}

			await Promise.all(promises);

			const response = await apiCall.get(`${route}/provider`, `${providerDB.id}?active=true`);

			expect(response.status).toBe(200);

			const {
				data,
				count,
				limit,
				offset,
				offsetMax,
				total,
			}: {
				data: Employee[];
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

		it("Should get all employees from an provider", async () => {
			const contactsResponse = await addContactListToDB({ nestApp, civility: civilityDB, numberOfRows: 15 });

			const promises = [];
			for (let i = 0; i < contactsResponse.length; i += 1) {
				const contact = contactsResponse[i];

				promises.push(
					addEmployeeToDB({
						nestApp,
						provider: providerDB,
						contact,
						job: jobDB,
						numberOfRows: 3,
					}),
				);
			}

			await Promise.all(promises);

			const response = await apiCall.get(`${route}/provider`, `${providerDB.id}?active=false`);

			expect(response.status).toBe(200);

			const {
				data,
				count,
				limit,
				offset,
				offsetMax,
				total,
			}: {
				data: Employee[];
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

		it("Should update a employee", async () => {
			const employee = await addEmployeeToDB({
				nestApp,
				provider: providerDB,
				contact: contactDB,
				job: jobDB,
			});

			const newJob = await addJobToDB({ nestApp });

			const updateEmployeeDto: UpdateEmployeeDto = updateEmployeeMock({
				jobId: newJob.id,
			});

			const { status } = await apiCall.put(route, employee.id, updateEmployeeDto);

			expect(status).toBe(200);

			const { comment, email, endDate, phoneAreaCode, phoneNumber, secondaryEmails, secondaryPhones, job } =
				await getEmployeeFromDB({ nestApp, id: employee.id });

			expect(comment).toEqual(trimAndLowercase(updateEmployeeDto.comment));
			expect(email).toEqual(updateEmployeeDto.email);
			expect(endDate.toDateString()).toEqual(updateEmployeeDto.endDate.toDateString());
			expect(phoneAreaCode).toEqual(updateEmployeeDto.phoneAreaCode);
			expect(phoneNumber).toEqual(updateEmployeeDto.phoneNumber);
			expect(secondaryEmails).toBeDefined();
			expect(secondaryPhones).toBeDefined();
			expect(job.id).toEqual(updateEmployeeDto.jobId);
		});

		it("Should set all employee's optional values to null", async () => {
			const employee = await addEmployeeToDB({
				nestApp,
				provider: providerDB,
				contact: contactDB,
				job: jobDB,
			});

			const newJob = await addJobToDB({ nestApp });

			const updateEmployeeDto: UpdateEmployeeDto = {
				jobId: newJob.id,
				comment: null,
				email: null,
				endDate: null,
				phoneAreaCode: null,
				phoneNumber: null,
				secondaryEmails: null,
				secondaryPhones: null,
			};

			const { status } = await apiCall.put<UpdateEmployeeDto>(route, employee.id, updateEmployeeDto);

			const { job, comment, email, phoneAreaCode, phoneNumber, secondaryEmails, secondaryPhones } =
				await getEmployeeFromDB({ nestApp, id: employee.id });

			expect(status).toBe(200);

			expect(comment).toBeNull();
			expect(email).toBeNull();
			expect(phoneAreaCode).toBeNull();
			expect(phoneNumber).toBeNull();
			expect(secondaryEmails.length).toBe(0);
			expect(secondaryPhones.length).toBe(0);
			expect(job.id).toEqual(updateEmployeeDto.jobId);
		});
	});

	describe("DELETE", () => {
		it("Should delete a employee", async () => {
			const [contactResponse, providerResponse, jobResponse] = await Promise.all([
				addContactToDB({ nestApp, civility: civilityDB }),
				addProviderToDB({ nestApp, type: typeOrgaDB }),
				addJobToDB({ nestApp }),
			]);

			const employee = await addEmployeeToDB({
				nestApp,
				provider: providerResponse,
				contact: contactResponse,
				job: jobResponse,
			});

			const response = await apiCall.delete(route, employee.id);

			expect(response.status).toBe(200);
		});
	});
});
