import { INestApplication } from "@nestjs/common";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { CreatePayslipCountDto, UpdatePayslipCountDto } from "src/modules/payslip-count/dto";
import { IPayslipCountResponse } from "src/modules/payslip-count/entity/payslip-count.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";

import { addOrganizationToDB } from "./mocks/organization.mock";
import {
	createPayslipCountMock,
	addPayslipCountToDB,
	updatePayslipCountMock,
	getPayslipCountFromDB,
	addManyPayslipCountToDB,
} from "./mocks/payslip-count.mock";
import { addListValueToDB } from "./mocks/list-value.mock";

describe("PayslipCountController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/payslip-count";
	let apiCall: ApiCall;

	let organizationDB: IOrganizationResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		const typeOrgaDB = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });
		organizationDB = await addOrganizationToDB({ nestApp, type: typeOrgaDB });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE PAYSLIP COUNT - (/) - POST", () => {
		it("Should not create a payslipCount without the required headcountss", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a payslipCount with only the required headcountss", async () => {
			const createPayslipCountDto: CreatePayslipCountDto = createPayslipCountMock({
				organizationId: organizationDB.id,
			});

			const response = await apiCall.post<CreatePayslipCountDto>(route, {
				organizationId: createPayslipCountDto.organizationId,
				year: createPayslipCountDto.year,
				headcounts: createPayslipCountDto.headcounts,
			});

			expect(response.status).toBe(201);

			const { organization, year, headcounts }: IPayslipCountResponse = response.body;

			expect(organization.id).toEqual(createPayslipCountDto.organizationId);
			expect(year).toEqual(createPayslipCountDto.year);
			expect(headcounts).toEqual(createPayslipCountDto.headcounts);
		});

		it("Should create a payslipCount", async () => {
			const createPayslipCountDto: CreatePayslipCountDto = createPayslipCountMock({
				organizationId: organizationDB.id,
			});

			const response = await apiCall.post<CreatePayslipCountDto>(route, createPayslipCountDto);
			const { organization, year, headcounts }: IPayslipCountResponse = response.body;

			expect(response.status).toBe(201);

			expect(organization.id).toEqual(createPayslipCountDto.organizationId);
			expect(year).toEqual(createPayslipCountDto.year);
			expect(headcounts).toEqual(createPayslipCountDto.headcounts);
		});
	});

	describe("UPDATE PAYSLIP COUNT - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all headcountss of a payslipCount ", async () => {
			const payslipCount = await addPayslipCountToDB({ nestApp, organization: organizationDB });

			const updatePayslipCountDto: UpdatePayslipCountDto = updatePayslipCountMock();

			const { status } = await apiCall.put<UpdatePayslipCountDto>(route, payslipCount.id, updatePayslipCountDto);
			const response = await getPayslipCountFromDB({ nestApp, id: payslipCount.id });

			expect(status).toBe(200);
			expect(response.headcounts).toEqual(updatePayslipCountDto.headcounts);
		});
	});

	describe("DELETE PAYSLIP COUNT - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a payslipCount that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a payslipCount", async () => {
			const payslipCount = await addPayslipCountToDB({ nestApp, organization: organizationDB });

			const { status } = await apiCall.delete(route, payslipCount.id);

			expect(status).toBe(200);
		});
	});

	describe("GET PAYSLIP COUNT - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a payslipCount", async () => {
			const payslipCount = await addPayslipCountToDB({ nestApp, organization: organizationDB });

			const { body, status } = await apiCall.get(route, payslipCount.id);

			expect(status).toBe(200);

			expect(body.year).toEqual(payslipCount.year);
			expect(body.organization.id).toEqual(payslipCount.organization.id);
			expect(body.headcounts).toEqual(payslipCount.headcounts);
		});

		it("Should recover the list of establishments by organization", async () => {
			await addManyPayslipCountToDB({ nestApp, organization: organizationDB, numberOfRows: 10 });

			const { status, body } = await apiCall.get(route, `organization/${organizationDB.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((payslipCount: IPayslipCountResponse) => {
				expect(payslipCount.organization).toBeUndefined();
				expect(payslipCount.year).toBeDefined();
				expect(payslipCount.headcounts).toBeDefined();
			});
		});
	});
});
