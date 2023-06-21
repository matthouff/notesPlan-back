import { INestApplication } from "@nestjs/common";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addNetworkToDB } from "./mocks/network.mock";
import { addNetworkOrganizationToDB } from "./mocks/network-organization";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";

describe("ExportController (e2e)", () => {
	let nestApp: INestApplication;
	let apiCall: ApiCall;

	beforeEach(async () => {
		nestApp = await initializeTestApp();
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("GET", () => {
		describe("network-organization/:id", () => {
			let route = "/export/network-organization/network";

			let networkDB: INetworkResponse;
			let organizationDB: IOrganizationResponse;
			let baseListValue: IListValueResponse;

			beforeEach(async () => {
				baseListValue = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });

				[networkDB, organizationDB] = await Promise.all([
					addNetworkToDB({ nestApp }),
					addOrganizationToDB({ nestApp, type: baseListValue }),
				]);

				apiCall = new ApiCall(nestApp);
			});

			it.each(["20518003-f863-46ed-b7e6", 38252, "randomVal"])(
				"Should throw an error if the provided id isn't valid",
				async (id) => {
					const { status } = await apiCall.get(route, id);

					expect(status).toBe(400);
				},
			);

			it("Should return a buffer", async () => {
				await addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: organizationDB,
					numberOfRows: 100,
				});

				const { status } = await apiCall.get(route, networkDB.id);

				expect(status).toBe(200);
			}, 20000);
		});
	});
});
