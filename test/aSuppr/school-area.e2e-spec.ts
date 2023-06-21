import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateSchoolAreaDto, UpdateSchoolAreaDto } from "src/modules/school-area/dto";
import { ISchoolAreaResponse } from "src/modules/school-area/entity/school-area.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IEstablishmentResponse } from "src/modules/establishment/entity/establishment.interface";
import { IExerciseResponse } from "src/modules/exercise/entity/exercise.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addManyExerciseToDB } from "./mocks/exercise.mock";
import { addEstablishmentToDB } from "./mocks/establishment.mock";
import {
	createSchoolAreaMock,
	addSchoolAreaToDB,
	updateSchoolAreaMock,
	getSchoolAreaFromDB,
} from "./mocks/school-area.mock";

describe("SchoolAreaController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/school-area";
	let apiCall: ApiCall;

	let typeOrgaDB: IListValueResponse;
	let typeEstabDB: IListValueResponse;
	let typeSchoolAreaDB: IListValueResponse;
	let organizationDB: IOrganizationResponse;
	let establishmentDB: IEstablishmentResponse;
	let listExerciseDB: IExerciseResponse[];

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[typeOrgaDB, typeEstabDB, typeSchoolAreaDB, listExerciseDB] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.ESTABLISHMENT_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.SCHOOL_AREA_TYPE }),
			addManyExerciseToDB({ nestApp, numberOfRows: 5 }),
		]);

		organizationDB = await addOrganizationToDB({ nestApp, type: typeOrgaDB });
		establishmentDB = await addEstablishmentToDB({ nestApp, type: typeEstabDB, organization: organizationDB });

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE SCHOOL AREA - (/) - POST", () => {
		it("Should not create a schoolArea without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a schoolArea with only the required values", async () => {
			const createSchoolAreaDto: CreateSchoolAreaDto = createSchoolAreaMock({
				organizationId: organizationDB.id,
				typeId: typeSchoolAreaDB.id,
			});

			const response = await apiCall.post<CreateSchoolAreaDto>(route, {
				organizationId: createSchoolAreaDto.organizationId,
				typeId: createSchoolAreaDto.typeId,
				name: createSchoolAreaDto.name,
			});

			expect(response.status).toBe(201);

			const { name, organization, type }: ISchoolAreaResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createSchoolAreaDto.name));
			expect(type.id).toEqual(createSchoolAreaDto.typeId);
			expect(organization.id).toEqual(createSchoolAreaDto.organizationId);
		});

		it("Should create a establishment", async () => {
			const createSchoolAreaDto: CreateSchoolAreaDto = createSchoolAreaMock({
				organizationId: organizationDB.id,
				typeId: typeSchoolAreaDB.id,
				establishmentId: establishmentDB.id,
				listExerciseId: listExerciseDB.map((exercise) => exercise.id),
			});

			const response = await apiCall.post<CreateSchoolAreaDto>(route, createSchoolAreaDto);
			const { name, organization, type, establishment, headcounts, code }: ISchoolAreaResponse = response.body;

			expect(response.status).toBe(201);

			expect(name).toEqual(trimAndUppercase(createSchoolAreaDto.name));
			expect(organization.id).toEqual(createSchoolAreaDto.organizationId);
			expect(type.id).toEqual(createSchoolAreaDto.typeId);
			expect(establishment.id).toEqual(createSchoolAreaDto.establishmentId);
			expect(headcounts.length).toEqual(createSchoolAreaDto.headcounts.length);
			expect(code).toEqual(createSchoolAreaDto.code);
		});
	});

	describe("UPDATE SCHOOL AREA - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a schoolArea ", async () => {
			const [schoolArea, establishmentUpdate, typeUpdate, listExerciseUpdate] = await Promise.all([
				addSchoolAreaToDB({
					nestApp,
					organization: organizationDB,
					type: typeSchoolAreaDB,
					establishment: establishmentDB,
					listExercise: listExerciseDB,
				}),
				addEstablishmentToDB({
					nestApp,
					organization: organizationDB,
					type: typeEstabDB,
				}),
				addListValueToDB({ nestApp, flag: EFlagListValue.SCHOOL_AREA_TYPE }),
				addManyExerciseToDB({ nestApp, numberOfRows: 3 }),
			]);

			const updateSchoolAreaDto: UpdateSchoolAreaDto = updateSchoolAreaMock({
				typeId: typeUpdate.id,
				establishmentId: establishmentUpdate.id,
				listExerciseId: listExerciseUpdate.map((exercise) => exercise.id),
			});

			const { status } = await apiCall.put<UpdateSchoolAreaDto>(route, schoolArea.id, updateSchoolAreaDto);
			const response = await getSchoolAreaFromDB({ nestApp, id: schoolArea.id });

			expect(status).toBe(200);
			expect(response.name).toEqual(trimAndUppercase(updateSchoolAreaDto.name));
			expect(response.establishment.id).toEqual(updateSchoolAreaDto.establishmentId);
			expect(response.type.id).toEqual(updateSchoolAreaDto.typeId);
			expect(response.code).toEqual(updateSchoolAreaDto.code);
			expect(response.headcounts.length).toEqual(updateSchoolAreaDto.headcounts.length);
		});

		it("Should not set to null all optionals values of a schoolArea", async () => {
			const schoolArea = await addSchoolAreaToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolAreaDB,
				establishment: establishmentDB,
				listExercise: listExerciseDB,
			});

			const updateSchoolAreaDto: UpdateSchoolAreaDto = {};

			const { status } = await apiCall.put<UpdateSchoolAreaDto>(route, schoolArea.id, updateSchoolAreaDto);
			const response = await getSchoolAreaFromDB({ nestApp, id: schoolArea.id });

			expect(status).toBe(200);
			expect(response.type).toBeDefined();
			expect(response.establishment).toBeDefined();
			expect(response.headcounts.length).toBeDefined();
			expect(response.code).toBeDefined();
		});

		it("Should set to null all optionals values of a establishment", async () => {
			const schoolArea = await addSchoolAreaToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolAreaDB,
				establishment: establishmentDB,
				listExercise: listExerciseDB,
			});

			const updateSchoolAreaDto: UpdateSchoolAreaDto = { establishmentId: null, headcounts: null, code: null };

			const { status } = await apiCall.put<UpdateSchoolAreaDto>(route, schoolArea.id, updateSchoolAreaDto);
			const response = await getSchoolAreaFromDB({ nestApp, id: schoolArea.id });

			expect(status).toBe(200);
			expect(response.establishment).toBeNull();
			expect(response.code).toBeNull();
			expect(response.headcounts).toHaveLength(0);
		});
	});

	describe("DELETE SCHOOL AREA - (/:id) - DELETE", () => {
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
			const establishment = await addSchoolAreaToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolAreaDB,
				establishment: establishmentDB,
				listExercise: listExerciseDB,
			});

			const { status } = await apiCall.delete(route, establishment.id);

			expect(status).toBe(200);
		});
	});

	describe("GET SCHOOL AREA - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a establishment", async () => {
			const schoolArea = await addSchoolAreaToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolAreaDB,
				establishment: establishmentDB,
				listExercise: listExerciseDB,
			});

			const { body, status } = await apiCall.get(route, schoolArea.id);

			expect(status).toBe(200);

			expect(body.id).toEqual(schoolArea.id);
			expect(body.name).toEqual(trimAndUppercase(schoolArea.name));
			expect(body.type.id).toEqual(schoolArea.type.id);
			expect(body.code).toEqual(schoolArea.code);
			expect(body.headcounts.length).toEqual(schoolArea.headcounts.length);
			expect(body.organization.id).toEqual(schoolArea.organization.id);
			expect(body.establishment.id).toEqual(schoolArea.establishment.id);
		});

		it("Should recover the list of establishments by organization", async () => {
			await addSchoolAreaToDB({
				nestApp,
				organization: organizationDB,
				type: typeSchoolAreaDB,
				establishment: establishmentDB,
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

			body.data.forEach((establishment: ISchoolAreaResponse) => {
				expect(establishment.organization).toBeUndefined();
				expect(establishment.establishment).toBeDefined();
				expect(establishment.headcounts).toBeDefined();
				expect(establishment.name).toBeDefined();
				expect(establishment.code).toBeDefined();
			});
		});
	});
});
