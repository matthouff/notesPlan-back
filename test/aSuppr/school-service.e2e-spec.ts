import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateSchoolServiceDto, UpdateSchoolServiceDto } from "src/modules/school-service/dto";
import { ISchoolServiceResponse } from "src/modules/school-service/entity/school-service.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IExerciseResponse } from "src/modules/exercise/entity/exercise.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addManyExerciseToDB } from "./mocks/exercise.mock";
import {
	createSchoolServiceMock,
	addSchoolServiceToDB,
	updateSchoolServiceMock,
	getSchoolServiceFromDB,
} from "./mocks/school-service.mock";

describe("SchoolServiceController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/school-service";
	let apiCall: ApiCall;

	let typeOrgaDB: IListValueResponse;
	let typeSchoolServiceDB: IListValueResponse;
	let organizationDB: IOrganizationResponse;
	let listExerciseDB: IExerciseResponse[];

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		typeOrgaDB = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });

		[typeSchoolServiceDB, organizationDB, listExerciseDB] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.SCHOOL_SERVICE_TYPE }),
			addOrganizationToDB({ nestApp, type: typeOrgaDB }),
			addManyExerciseToDB({ nestApp, numberOfRows: 5 }),
		]);

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE SCHOOL SERVICE - (/) - POST", () => {
		it("Should not create a schoolService without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a schoolService with only the required values", async () => {
			const createSchoolServiceDto: CreateSchoolServiceDto = createSchoolServiceMock({
				organizationId: organizationDB.id,
				typeId: typeSchoolServiceDB.id,
			});

			const response = await apiCall.post<CreateSchoolServiceDto>(route, {
				organizationId: createSchoolServiceDto.organizationId,
				typeId: createSchoolServiceDto.typeId,
				name: createSchoolServiceDto.name,
				code: undefined,
			});

			expect(response.status).toBe(201);

			const { name, organization, type }: ISchoolServiceResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createSchoolServiceDto.name));
			expect(type.id).toEqual(createSchoolServiceDto.typeId);
			expect(organization.id).toEqual(createSchoolServiceDto.organizationId);
		});

		it("Should create a schoolService", async () => {
			const createSchoolServiceDto: CreateSchoolServiceDto = createSchoolServiceMock({
				organizationId: organizationDB.id,
				typeId: typeSchoolServiceDB.id,
				listExerciseId: listExerciseDB.map((exercise) => exercise.id),
			});

			const response = await apiCall.post<CreateSchoolServiceDto>(route, createSchoolServiceDto);
			const { name, organization, type, headcounts, code }: ISchoolServiceResponse = response.body;

			expect(response.status).toBe(201);

			expect(name).toEqual(trimAndUppercase(createSchoolServiceDto.name));
			expect(organization.id).toEqual(createSchoolServiceDto.organizationId);
			expect(type.id).toEqual(createSchoolServiceDto.typeId);
			expect(headcounts.length).toEqual(createSchoolServiceDto.headcounts.length);
			expect(code).toEqual(createSchoolServiceDto.code);
		});
	});

	describe("UPDATE SCHOOL SERVICE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a schoolService ", async () => {
			const [schoolService, typeUpdate, listExerciseUpdate] = await Promise.all([
				addSchoolServiceToDB({
					nestApp,
					organization: organizationDB,
					type: typeSchoolServiceDB,
					listExercise: listExerciseDB,
				}),
				addListValueToDB({ nestApp, flag: EFlagListValue.SCHOOL_SERVICE_TYPE }),
				addManyExerciseToDB({ nestApp, numberOfRows: 3 }),
			]);

			const updateSchoolServiceDto: UpdateSchoolServiceDto = updateSchoolServiceMock({
				typeId: typeUpdate.id,
				listExerciseId: listExerciseUpdate.map((exercise) => exercise.id),
			});

			const { status } = await apiCall.put<UpdateSchoolServiceDto>(
				route,
				schoolService.id,
				updateSchoolServiceDto,
			);
			const response = await getSchoolServiceFromDB({ nestApp, id: schoolService.id });

			expect(status).toBe(200);
			expect(response.name).toEqual(trimAndUppercase(updateSchoolServiceDto.name));
			expect(response.type.id).toEqual(updateSchoolServiceDto.typeId);
			expect(response.headcounts.length).toEqual(updateSchoolServiceDto.headcounts.length);
			expect(response.code).toEqual(updateSchoolServiceDto.code);
		});

		it("Should not set to null all optionals values of a schoolService", async () => {
			const schoolService = await addSchoolServiceToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolServiceDB,
				listExercise: listExerciseDB,
			});

			const updateSchoolServiceDto: UpdateSchoolServiceDto = {};

			const { status } = await apiCall.put<UpdateSchoolServiceDto>(
				route,
				schoolService.id,
				updateSchoolServiceDto,
			);
			const response = await getSchoolServiceFromDB({ nestApp, id: schoolService.id });

			expect(status).toBe(200);
			expect(response.type).toBeDefined();
			expect(response.code).toBeDefined();
			expect(response.headcounts.length).toBeDefined();
		});

		it("Should set to null all optionals values of a schoolService", async () => {
			const schoolService = await addSchoolServiceToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolServiceDB,
				listExercise: listExerciseDB,
			});

			const updateSchoolServiceDto: UpdateSchoolServiceDto = { headcounts: null, code: null };

			const { status } = await apiCall.put<UpdateSchoolServiceDto>(
				route,
				schoolService.id,
				updateSchoolServiceDto,
			);
			const response = await getSchoolServiceFromDB({ nestApp, id: schoolService.id });

			expect(status).toBe(200);
			expect(response.headcounts).toHaveLength(0);
			expect(response.code).toBeNull();
		});
	});

	describe("DELETE SCHOOL SERVICE - (/:id) - DELETE", () => {
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
			const establishment = await addSchoolServiceToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolServiceDB,
				listExercise: listExerciseDB,
			});

			const { status } = await apiCall.delete(route, establishment.id);

			expect(status).toBe(200);
		});
	});

	describe("GET SCHOOL SERVICE - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a establishment", async () => {
			const schoolService = await addSchoolServiceToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolServiceDB,
				listExercise: listExerciseDB,
			});

			const { body, status } = await apiCall.get(route, schoolService.id);

			expect(status).toBe(200);

			expect(body.id).toEqual(schoolService.id);
			expect(body.name).toEqual(trimAndUppercase(schoolService.name));
			expect(body.type.id).toEqual(schoolService.type.id);
			expect(body.code).toEqual(schoolService.code);
			expect(body.headcounts.length).toEqual(schoolService.headcounts.length);
			expect(body.organization.id).toEqual(schoolService.organization.id);
		});

		it("Should recover the list of establishments by organization", async () => {
			await addSchoolServiceToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolServiceDB,
				listExercise: listExerciseDB,
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

			body.data.forEach((establishment: ISchoolServiceResponse) => {
				expect(establishment.organization).toBeUndefined();
				expect(establishment.headcounts).toBeDefined();
				expect(establishment.name).toBeDefined();
				expect(establishment.code).toBeDefined();
			});
		});
	});
});
