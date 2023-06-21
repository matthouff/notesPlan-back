import { INestApplication } from "@nestjs/common";
import { CreateExerciseDto } from "src/modules/exercise/dto";
import { IExerciseResponse } from "src/modules/exercise/entity/exercise.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { createExerciseMock } from "./mocks/exercise.mock";

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

			const { startDate, endDate }: IExerciseResponse = response.body;

			expect(startDate).toEqual(createExerciseDto.startDate.toISOString());
			expect(endDate).toEqual(createExerciseDto.endDate.toISOString());
		});
	});

	describe("GET EXERCISE - (/:id) - GET", () => {
		it("Should find an exercise", async () => {
			const createExerciseDto: CreateExerciseDto = createExerciseMock();

			const responsePost = await apiCall.post<CreateExerciseDto>(route, { ...createExerciseDto });

			const response = await apiCall.get(route, responsePost.body.id);

			const { startDate, endDate }: IExerciseResponse = response.body;
			const oldStartDate = createExerciseDto.startDate.toISOString();
			const oldEndDate = createExerciseDto.endDate.toISOString();
			expect(startDate).toEqual(oldStartDate);
			expect(endDate).toEqual(oldEndDate);
		});
	});
});
