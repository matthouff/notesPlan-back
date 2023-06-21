import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateJobDto, UpdateJobDto } from "src/modules/job/dto";
import { IJobResponse } from "src/modules/job/entity/job.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addJobToDB, addManyJobToDB, createJobMock, getJobFromDB, updateJobMock } from "./mocks/job.mock";

describe("JobController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/job";
	let apiCall: ApiCall;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE JOB - (/) - POST", () => {
		it("Should not create a job without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a job with only the required values", async () => {
			const createJobDto: CreateJobDto = createJobMock();

			const response = await apiCall.post<CreateJobDto>(route, { name: createJobDto.name });
			expect(response.status).toBe(201);

			const { name, femaleName }: IJobResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createJobDto.name));
			expect(femaleName).toEqual(trimAndUppercase(createJobDto.name));
		});

		it("Should create a job", async () => {
			const createJobDto: CreateJobDto = createJobMock();

			const response = await apiCall.post<CreateJobDto>(route, createJobDto);
			expect(response.status).toBe(201);

			const { name, femaleName }: IJobResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createJobDto.name));
			expect(femaleName).toEqual(trimAndUppercase(createJobDto.femaleName));
		});

		it.each([
			{ ...createJobMock(), name: "Test" },
			{ ...createJobMock(), name: "test" },
			{ ...createJobMock(), name: "TEST" },
			{ ...createJobMock(), name: "tesT" },
		])("Should not create a job that as a duplicate name", async (createJobDto) => {
			const duplicate = "Test";
			await addJobToDB({ nestApp, name: duplicate });

			const response = await apiCall.post<CreateJobDto>(route, createJobDto);
			expect(response.status).toBe(409);
		});

		it.each([
			{ ...createJobMock(), name: "" },
			{ ...createJobMock(), femaleName: 654 },
		])("Should not create a job while receiving invalid data", async (createJobDto) => {
			const response = await apiCall.post(route, createJobDto);
			expect(response.status).toBe(400);
		});
	});

	describe("UPDATE JOB - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...createJobMock(), name: "Test" },
			{ ...createJobMock(), name: "test" },
			{ ...createJobMock(), name: "TEST" },
			{ ...createJobMock(), name: "tesT" },
		])("Should not update a job that as a duplicate value", async (updateJobDto) => {
			const duplicate = "Test";
			await addJobToDB({ nestApp, name: duplicate });
			const job = await addJobToDB({ nestApp });

			const response = await apiCall.put<UpdateJobDto>(route, job.id, updateJobDto);

			expect(response.status).toBe(409);
		});

		it("Should update all values of a job ", async () => {
			const job = await addJobToDB({ nestApp });

			const updateJobDto: UpdateJobDto = updateJobMock();

			const { status } = await apiCall.put<UpdateJobDto>(route, job.id, updateJobDto);
			const response = await getJobFromDB({ nestApp, id: job.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateJobDto.name));
			expect(response.femaleName).toEqual(trimAndUppercase(updateJobDto.femaleName));
		});

		it("Should not set to null all optionals values of a job", async () => {
			const job = await addJobToDB({ nestApp });

			const updateJobDto: UpdateJobDto = {
				name: undefined,
				femaleName: undefined,
			};
			const { status } = await apiCall.put<UpdateJobDto>(route, job.id, updateJobDto);
			const response = await getJobFromDB({ nestApp, id: job.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.femaleName).toBeDefined();
		});

		it("Should not set to null all optionals values of a job", async () => {
			const job = await addJobToDB({ nestApp });

			const updateJobDto: UpdateJobDto = {
				name: null,
				femaleName: null,
			};
			const { status } = await apiCall.put<UpdateJobDto>(route, job.id, updateJobDto);
			const response = await getJobFromDB({ nestApp, id: job.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.femaleName).toBeDefined();
		});
	});

	describe("DELETE JOB - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a job that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a job", async () => {
			const job = await addJobToDB({ nestApp });

			const { status } = await apiCall.delete(route, job.id);

			expect(status).toBe(200);
		});
	});

	describe("GET JOB - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a job", async () => {
			const job = await addJobToDB({ nestApp });

			const response = await apiCall.get(route, job.id);

			const { id, name, femaleName }: IJobResponse = response.body;

			expect(id).toEqual(job.id);
			expect(name).toBeDefined();
			expect(femaleName).toBeDefined();
		});
	});

	describe("GET JOBS - (/) - GET", () => {
		it("Should find a list of jobs", async () => {
			await addManyJobToDB({ nestApp, numberOfRows: 10 });

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);
			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((job: IJobResponse) => {
				expect(job.id).toEqual(job.id);
				expect(job.name).toBeDefined();
				expect(job.femaleName).toBeDefined();
			});
		});
	});
});
