import { INestApplication } from "@nestjs/common";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IExerciseResponse } from "src/modules/exercise/entity/exercise.interface";
import { CreateHeadcountOrganizationDto, UpdateHeadcountOrganizationDto } from "src/modules/headcount-organization/dto";
import { IHeadcountOrganizationResponse } from "src/modules/headcount-organization/entity/headcount-organization.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";

import { addListValueToDB } from "./mocks/list-value.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addExerciseToDB } from "./mocks/exercise.mock";
import {
	createHeadcountOrganizationMock,
	addHeadcountOrganizationToDB,
	updateHeadcountOrganizationMock,
	getHeadcountOrganizationFromDB,
} from "./mocks/headcount-organization.mock";

describe("HeadcountOrganizationController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/headcount-organization";
	let apiCall: ApiCall;

	let organizationDB: IOrganizationResponse;
	let exerciseDB: IExerciseResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		const typeOrgaDB = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });

		[exerciseDB, organizationDB] = await Promise.all([
			addExerciseToDB({ nestApp }),
			addOrganizationToDB({ nestApp, type: typeOrgaDB }),
		]);

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE HEADCOUNTORGANIZATION - (/) - POST", () => {
		it("Should not create a headcountorganization without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a headcountorganization with only the required values", async () => {
			const createHeadcountOrganizationDto: CreateHeadcountOrganizationDto = createHeadcountOrganizationMock({
				organizationId: organizationDB.id,
				exerciseId: exerciseDB.id,
			});

			const response = await apiCall.post<CreateHeadcountOrganizationDto>(route, {
				organizationId: createHeadcountOrganizationDto.organizationId,
				exerciseId: createHeadcountOrganizationDto.exerciseId,
				value: createHeadcountOrganizationDto.value,
			});

			expect(response.status).toBe(201);

			const { organization, exercise, value }: IHeadcountOrganizationResponse = response.body;

			expect(organization.id).toEqual(createHeadcountOrganizationDto.organizationId);
			expect(exercise.id).toEqual(createHeadcountOrganizationDto.exerciseId);
			expect(value).toEqual(createHeadcountOrganizationDto.value);
		});

		it("Should create a headcountorganization", async () => {
			const createHeadcountOrganizationDto: CreateHeadcountOrganizationDto = createHeadcountOrganizationMock({
				organizationId: organizationDB.id,
				exerciseId: exerciseDB.id,
			});

			const response = await apiCall.post<CreateHeadcountOrganizationDto>(route, createHeadcountOrganizationDto);
			const { organization, exercise, value }: IHeadcountOrganizationResponse = response.body;

			expect(response.status).toBe(201);

			expect(organization.id).toEqual(createHeadcountOrganizationDto.organizationId);
			expect(exercise.id).toEqual(createHeadcountOrganizationDto.exerciseId);
			expect(value).toEqual(createHeadcountOrganizationDto.value);
		});
	});

	describe("UPDATE HEADCOUNTORGANIZATION - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a headcountorganization ", async () => {
			const headcountOrganization = await addHeadcountOrganizationToDB({
				nestApp,
				organization: organizationDB,
				exercise: exerciseDB,
			});

			const updateHeadcountOrganizationDto: UpdateHeadcountOrganizationDto = updateHeadcountOrganizationMock();

			const { status } = await apiCall.put<UpdateHeadcountOrganizationDto>(
				route,
				headcountOrganization.id,
				updateHeadcountOrganizationDto,
			);
			const response = await getHeadcountOrganizationFromDB({ nestApp, id: headcountOrganization.id });

			expect(status).toBe(200);
			expect(response.value).toEqual(updateHeadcountOrganizationDto.value);
		});
	});

	describe("DELETE HEADCOUNTORGANIZATION - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a headcountorganization that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a headcountorganization", async () => {
			const headcountorganization = await addHeadcountOrganizationToDB({
				nestApp,
				organization: organizationDB,
				exercise: exerciseDB,
			});

			const { status } = await apiCall.delete(route, headcountorganization.id);

			expect(status).toBe(200);
		});
	});

	describe("GET HEADCOUNTORGANIZATION - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a headcountorganization", async () => {
			const headcountorganization = await addHeadcountOrganizationToDB({
				nestApp,
				organization: organizationDB,
				exercise: exerciseDB,
			});

			const { body, status } = await apiCall.get(route, headcountorganization.id);

			expect(status).toBe(200);

			expect(body.exercise.id).toEqual(headcountorganization.exercise.id);
			expect(body.organization.id).toEqual(headcountorganization.organization.id);
			expect(body.value).toEqual(headcountorganization.value);
		});

		it("Should recover the list of establishments by organization", async () => {
			await addHeadcountOrganizationToDB({
				nestApp,
				organization: organizationDB,
				exercise: exerciseDB,
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

			body.data.forEach((headcountOrganization: IHeadcountOrganizationResponse) => {
				expect(headcountOrganization.organization).toBeUndefined();
				expect(headcountOrganization.exercise).toBeDefined();
				expect(headcountOrganization.value).toBeDefined();
			});
		});
	});
});
