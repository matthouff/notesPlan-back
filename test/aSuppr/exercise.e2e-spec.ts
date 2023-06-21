import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateExerciseDto, UpdateExerciseDto } from "src/modules/exercise/dto";
import { IExerciseResponse } from "src/modules/exercise/entity/exercise.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addExerciseToDB,
	addManyExerciseToDB,
	createExerciseMock,
	getExerciseFromDB,
	updateExerciseMock,
} from "./mocks/exercise.mock";

describe("ExerciseController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/exercise";
	let apiCall: ApiCall;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE EXERCISE - (/) - POST", () => {
		it("Should not create an exercise without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create an exercise", async () => {
			const createExerciseDto: CreateExerciseDto = createExerciseMock();

			const response = await apiCall.post<CreateExerciseDto>(route, createExerciseDto);

			expect(response.status).toBe(201);

			const { code, name, startDate, endDate }: IExerciseResponse = response.body;

			expect(code).toEqual(trimAndUppercase(createExerciseDto.code));
			expect(name).toEqual(trimAndUppercase(createExerciseDto.name));
			expect(startDate).toEqual(createExerciseDto.startDate.toISOString());
			expect(endDate).toEqual(createExerciseDto.endDate.toISOString());
		});

		it.each([
			createExerciseMock({ name: "Test" }),
			createExerciseMock({ name: "test" }),
			createExerciseMock({ name: "TEST" }),
			createExerciseMock({ name: "tesT" }),
		])("Should not create an exercise that as a duplicate name", async (createExerciseDto) => {
			const duplicateName = "Test";
			await addExerciseToDB({ nestApp, name: duplicateName });

			const response = await apiCall.post<CreateExerciseDto>(route, createExerciseDto);
			expect(response.status).toBe(409);
		});

		it.each([
			createExerciseMock({ code: "Test" }),
			createExerciseMock({ code: "test" }),
			createExerciseMock({ code: "TEST" }),
			createExerciseMock({ code: "tesT" }),
		])("Should not create an exercise that as a duplicate code", async (createExerciseDto) => {
			const duplicateCode = "Test";
			await addExerciseToDB({ nestApp, code: duplicateCode });

			const response = await apiCall.post<CreateExerciseDto>(route, createExerciseDto);
			expect(response.status).toBe(409);
		});

		it("Should not create an exercise that has invalid dates", async () => {
			const createExerciseDto: CreateExerciseDto = createExerciseMock({
				startDate: new Date("2021-03-18T08:09:25.966Z"),
				endDate: new Date("2020-03-18T08:09:25.966Z"),
			});

			const response = await apiCall.post<CreateExerciseDto>(route, createExerciseDto);
			expect(response.status).toBe(400);
		});

		it.each([
			{ ...createExerciseMock(), code: "" },
			{ ...createExerciseMock(), name: "" },
			{ ...createExerciseMock(), startDate: 65 },
			{ ...createExerciseMock(), endDate: 874 },
		])("Should not create an exercise while receiving invalid data", async (createExerciseDto) => {
			const response = await apiCall.post(route, createExerciseDto);
			expect(response.status).toBe(400);
		});
	});

	describe("UPDATE EXERCISE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...updateExerciseMock(), name: "Test" },
			{ ...updateExerciseMock(), name: "test" },
			{ ...updateExerciseMock(), name: "TEST" },
			{ ...updateExerciseMock(), name: "tesT" },
		])("Should not update an exercise that as a duplicate value", async (updateExerciseDto) => {
			const duplicateName = "Test";
			await addExerciseToDB({ nestApp, name: duplicateName });
			const exercise = await addExerciseToDB({ nestApp });

			const response = await apiCall.put<UpdateExerciseDto>(route, exercise.id, updateExerciseDto);

			expect(response.status).toBe(409);
		});

		it("Should update all values of an exercise ", async () => {
			const exercise = await addExerciseToDB({ nestApp });

			const updateExerciseDto: UpdateExerciseDto = updateExerciseMock();

			const { status } = await apiCall.put<UpdateExerciseDto>(route, exercise.id, updateExerciseDto);
			const response = await getExerciseFromDB({ nestApp, id: exercise.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateExerciseDto.name));
			expect(response.startDate.toDateString()).toEqual(updateExerciseDto.startDate.toDateString());
			expect(response.endDate.toDateString()).toEqual(updateExerciseDto.endDate.toDateString());
		});

		it.each([
			updateExerciseMock({
				startDate: new Date("2021-03-18T08:09:25.966Z"),
				endDate: new Date("2020-03-18T08:09:25.966Z"),
			}),
			updateExerciseMock({
				endDate: new Date("2020-03-18T08:09:25.966Z"),
			}),
			updateExerciseMock({
				startDate: new Date("2027-03-18T08:09:25.966Z"),
			}),
		])("Should not update an exercise with invalid dates", async (updateExerciseDto) => {
			const exercise = await addExerciseToDB({
				nestApp,
				startDate: new Date("2025-03-18T08:09:25.966Z"),
				endDate: new Date("2026-03-18T08:09:25.966Z"),
			});

			const { status } = await apiCall.put<UpdateExerciseDto>(route, exercise.id, updateExerciseDto);

			expect(status).toBe(400);
		});

		it("Should not set to null all optionals values of an exercise", async () => {
			const exercise = await addExerciseToDB({ nestApp });

			const updateExerciseDto: UpdateExerciseDto = {
				name: undefined,
				startDate: undefined,
				endDate: undefined,
			};
			const { status } = await apiCall.put<UpdateExerciseDto>(route, exercise.id, updateExerciseDto);
			const response = await getExerciseFromDB({ nestApp, id: exercise.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.startDate).toBeDefined();
			expect(response.endDate).toBeDefined();
		});

		it("Should set to null all optionals values of an exercise", async () => {
			const exercise = await addExerciseToDB({ nestApp });

			const updateExerciseDto: UpdateExerciseDto = {
				name: null,
				startDate: null,
				endDate: null,
			};
			const { status } = await apiCall.put<UpdateExerciseDto>(route, exercise.id, updateExerciseDto);
			const response = await getExerciseFromDB({ nestApp, id: exercise.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.startDate).toBeDefined();
			expect(response.endDate).toBeDefined();
		});
	});

	describe("DELETE EXERCISE - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete an exercise that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete an exercise", async () => {
			const exercise = await addExerciseToDB({ nestApp });

			const { status } = await apiCall.delete(route, exercise.id);

			expect(status).toBe(200);
		});
	});

	describe("GET EXERCISE - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find an exercise", async () => {
			const exercise = await addExerciseToDB({ nestApp });

			const response = await apiCall.get(route, exercise.id);

			const { id, code, name, startDate, endDate }: IExerciseResponse = response.body;

			expect(id).toEqual(exercise.id);
			expect(code).toBeDefined();
			expect(name).toBeDefined();
			expect(startDate).toBeDefined();
			expect(endDate).toBeDefined();
		});
	});

	describe("GET EXERCISES - (/) - GET", () => {
		it("Should recover the list of exercises", async () => {
			await addManyExerciseToDB({ nestApp, numberOfRows: 10 });

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((exercise: IExerciseResponse) => {
				expect(exercise.code).toBeDefined();
				expect(exercise.name).toBeDefined();
				expect(exercise.startDate).toBeDefined();
				expect(exercise.endDate).toBeDefined();
			});
		});
	});
});
