import { INestApplication } from "@nestjs/common";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { IUserResponse } from "src/modules/user/entity/user.interface";
import { IMemberResponse } from "src/modules/member/entity/member.interface";
import { IExerciseResponse } from "src/modules/exercise/entity/exercise.interface";
import { faker } from "@faker-js/faker";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addMemberToDB } from "./mocks/member.mock";
import { addManyNetworkToDB } from "./mocks/network.mock";
import { addManyUserToDB, addUserToDB } from "./mocks/user.mock";
import { addExerciseToDB } from "./mocks/exercise.mock";

interface IInitResponse {
	user: IUserResponse;
	members: IMemberResponse[];
	exercise?: IExerciseResponse;
}

describe("App Controller (e2e)", () => {
	let nestApp: INestApplication;
	let apiCall: ApiCall;

	let networksDB: INetworkResponse[];
	let usersDB: IUserResponse[];

	describe("GET - (init/:email) - GET", () => {
		beforeEach(async () => {
			nestApp = await initializeTestApp();

			[networksDB, usersDB] = await Promise.all([
				addManyNetworkToDB({ nestApp, numberOfRows: 3 }),
				addManyUserToDB({ nestApp, numberOfRows: 3 }),
			]);

			await Promise.all([
				addMemberToDB({ nestApp, network: networksDB[0], user: usersDB[0] }),
				addMemberToDB({ nestApp, network: networksDB[0], user: usersDB[1] }),
				addMemberToDB({ nestApp, network: networksDB[0], user: usersDB[2] }),
				addMemberToDB({ nestApp, network: networksDB[1], user: usersDB[0] }),
				addMemberToDB({ nestApp, network: networksDB[1], user: usersDB[1] }),
				addMemberToDB({ nestApp, network: networksDB[2], user: usersDB[2] }),
			]);

			apiCall = new ApiCall(nestApp);
		});

		afterEach(async () => {
			await closeTestAppConnexion(nestApp);
		});

		const email = "email_test_init@gmail.com";

		it("Should not return user data if user does not exist", async () => {
			const response = await apiCall.get("/init", email);
			expect(response.status).toBe(404);
		});

		it("Should not return user data if user hasn't a network", async () => {
			await addUserToDB({ nestApp, email });
			const response = await apiCall.get("/init", email);
			expect(response.status).toBe(403);
		});

		it("Should find all user data", async () => {
			const exerciseTest = await addExerciseToDB({
				nestApp,
				startDate: faker.date.past(),
				endDate: faker.date.future(),
			});
			const userTest = await addUserToDB({ nestApp, email });

			const membersTest = await Promise.all([
				addMemberToDB({ nestApp, network: networksDB[0], user: userTest }),
				addMemberToDB({ nestApp, network: networksDB[1], user: userTest }),
				addMemberToDB({ nestApp, network: networksDB[2], user: userTest }),
			]);

			const response = await apiCall.get("/init", email);
			const { user, members, exercise }: IInitResponse = response.body;

			expect(response.status).toBe(200);
			expect(user.id).toEqual(userTest.id);
			expect(members.length).toEqual(membersTest.length);
			expect(members.find((member) => member.id === membersTest[0].id)).toBeDefined();
			expect(members.find((member) => member.id === membersTest[1].id)).toBeDefined();
			expect(members.find((member) => member.id === membersTest[2].id)).toBeDefined();
			expect(exercise.id).toEqual(exerciseTest.id);
		});
	});

	// describe("Gobal search by email", () => {
	// 	const email = "test@email.com";

	// 	let baseListValue: IListValueResponse;
	// 	let baseJob: IJobResponse;

	// 	let baseOrganization: IOrganizationResponse;
	// 	let baseContact: IContactResponse;
	// 	let baseProvider: IProviderResponse;
	// 	let baseCorrespondent: ICorrespondentResponse;
	// 	let baseEmployee: IEmployeeResponse;

	// 	beforeEach(async () => {
	// 		nestApp = await initializeTestApp();

	// 		[baseListValue, baseJob] = await Promise.all([addListValueToDB({ nestApp }), addJobToDB({ nestApp })]);

	// 		[baseOrganization, baseContact, baseProvider] = await Promise.all([
	// 			addOrganizationToDB({ nestApp, type: baseListValue }),
	// 			addContactToDB({ nestApp, civility: baseListValue }),
	// 			addProviderToDB({ nestApp, type: baseListValue }),
	// 		]);

	// 		[baseCorrespondent, baseEmployee] = await Promise.all([
	// 			addCorrespondentToDB({
	// 				nestApp,
	// 				contact: baseContact,
	// 				organization: baseOrganization,
	// 				job: baseJob,
	// 			}),
	// 			addEmployeeToDB({
	// 				nestApp,
	// 				provider: baseProvider,
	// 				contact: baseContact,
	// 				job: baseJob,
	// 			}),
	// 		]);

	// 		apiCall = new ApiCall(nestApp);
	// 	});
	// });
});
