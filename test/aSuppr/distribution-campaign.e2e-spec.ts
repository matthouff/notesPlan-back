import { INestApplication } from "@nestjs/common";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { CreateDistributionCampaignDto, UpdateDistributionCampaignDto } from "src/modules/distribution-campaign/dto";
import { IDistributionCampaignResponse } from "src/modules/distribution-campaign/entity/distribution-campaign.interface";
import { trimAndUppercase } from "@asrec/misc";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { IJobResponse } from "src/modules/job/entity/job.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { IContactResponse } from "src/modules/contact/entity/contact.interface";
import { ICorrespondentResponse } from "src/modules/correspondent/entity/correspondent.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { INetworkOrganizationResponse } from "src/modules/network-organization/entity/network-organization.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addNetworkToDB } from "./mocks/network.mock";
import {
	addDistributionCampaignToDB,
	addManyDistributionCampaignToDB,
	createDistributionCampaignMock,
	getDistributionCampaignFromDB,
	updateDistributionCampaignMock,
} from "./mocks/distribution-campaign.mock";
import { addManyOrganizationToDB, addOrganizationToDB } from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addContactListToDB, addContactToDB } from "./mocks/contact.mock";
import { addManyCorrespondentToDB } from "./mocks/correspondent.mock";
import { addJobToDB } from "./mocks/job.mock";
import { createDataFilterMock } from "./mocks/data-filter.mock";
import { getManyNetworkOrganizationByNetworkFromDB } from "./mocks/network-organization";

describe("DistributionCampaignController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/distribution-campaign";
	let apiCall: ApiCall;

	let baseNetwork: INetworkResponse;
	let baseListValueOrg: IListValueResponse;
	let baseListValueCtc: IListValueResponse;
	let baseOrganization: IOrganizationResponse;
	let baseJob: IJobResponse;
	let baseContact: IContactResponse;

	let baseNetworkOrganizationsIncluded: INetworkOrganizationResponse[];
	let baseContactsExcluded: IContactResponse[];
	let baseCorrespondentsIncluded: ICorrespondentResponse[];

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);

		[baseNetwork, baseListValueOrg, baseListValueCtc, baseJob] = await Promise.all([
			addNetworkToDB({ nestApp }),
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY }),
			addJobToDB({ nestApp }),
		]);

		[baseOrganization, baseContact] = await Promise.all([
			addOrganizationToDB({ nestApp, type: baseListValueOrg, department: baseNetwork.departments[0] }),
			addContactToDB({ nestApp, civility: baseListValueCtc }),
		]);

		await addManyOrganizationToDB({
			numberOfRows: 10,
			nestApp,
			type: baseListValueOrg,
			department: baseNetwork.departments[0],
		});

		[baseNetworkOrganizationsIncluded, baseContactsExcluded, baseCorrespondentsIncluded] = await Promise.all([
			getManyNetworkOrganizationByNetworkFromDB({ nestApp, networkId: baseNetwork.id }),
			addContactListToDB({ nestApp, civility: baseListValueCtc, numberOfRows: 7 }),
			addManyCorrespondentToDB({
				nestApp,
				numberOfRows: 5,
				organization: baseOrganization,
				job: baseJob,
				contact: baseContact,
			}),
		]);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE DISTRIBUTION-CAMPAIGN - (/) - POST", () => {
		it("Should not create a distribution-campaign without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a distribution-campaign with only the required values", async () => {
			const createDistributionCampaignDto: CreateDistributionCampaignDto = createDistributionCampaignMock({
				networkId: baseNetwork.id,
			});

			const response = await apiCall.post<CreateDistributionCampaignDto>(route, {
				networkId: baseNetwork.id,
				name: createDistributionCampaignDto.name,
			});

			expect(response.status).toBe(201);

			const { name, network }: IDistributionCampaignResponse = response.body;

			expect(network.id).toEqual(baseNetwork.id);
			expect(name).toEqual(trimAndUppercase(createDistributionCampaignDto.name));
		});

		it("Should create a distribution-campaign", async () => {
			const createDistributionCampaignDto: CreateDistributionCampaignDto = createDistributionCampaignMock({
				filters: createDataFilterMock(),
				networkId: baseNetwork.id,
				networkOrganizationsIncludedIds: baseNetworkOrganizationsIncluded.map((item) => item.id),
				contactsExcludedIds: baseContactsExcluded.map((item) => item.id),
				correspondentsIncludedIds: baseCorrespondentsIncluded.map((item) => item.id),
			});

			const response = await apiCall.post<CreateDistributionCampaignDto>(route, createDistributionCampaignDto);

			expect(response.status).toBe(201);

			const { name, network, filters }: IDistributionCampaignResponse = response.body;

			expect(network.id).toEqual(baseNetwork.id);
			expect(name).toEqual(trimAndUppercase(createDistributionCampaignDto.name));
			expect(filters).toBeDefined();
		});

		it("Should not create a distribution-campaign that as a duplicate name", async () => {
			const duplicateName = "Test";
			await addDistributionCampaignToDB({ nestApp, name: duplicateName, network: baseNetwork });

			const values = [
				createDistributionCampaignMock({ name: "test", networkId: baseNetwork.id }),
				createDistributionCampaignMock({ name: "TEST", networkId: baseNetwork.id }),
				createDistributionCampaignMock({ name: "tEST", networkId: baseNetwork.id }),
				createDistributionCampaignMock({ name: "TESt", networkId: baseNetwork.id }),
				createDistributionCampaignMock({ name: "tESt", networkId: baseNetwork.id }),
			];

			for await (const createDistributionCampaignDto of values) {
				const response = await apiCall.post<CreateDistributionCampaignDto>(
					route,
					createDistributionCampaignDto,
				);
				expect(response.status).toBe(409);
			}
		});

		it("Should not create a distribution-campaign while receiving invalid data", async () => {
			const values = [
				createDistributionCampaignMock({ networkId: "612fa71c-5b23-46c9-b8c7-" }),
				createDistributionCampaignMock({ networkId: baseNetwork.id, name: "" }),
			];

			for await (const createDistributionCampaignDto of values) {
				const response = await apiCall.post(route, createDistributionCampaignDto);
				expect(response.status).toBe(400);
			}
		});
	});

	describe("UPDATE DISTRIBUTION-CAMPAIGN - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			updateDistributionCampaignMock({ name: "Test" }),
			updateDistributionCampaignMock({ name: "test" }),
			updateDistributionCampaignMock({ name: "TEST" }),
			updateDistributionCampaignMock({ name: "tesT" }),
		])(
			"Should not update a distribution-campaign that as a duplicate value for a same network",
			async (updateDistributionCampaignDto) => {
				await addDistributionCampaignToDB({ nestApp, name: "Test", network: baseNetwork });
				const distributionCampaign = await addDistributionCampaignToDB({ nestApp, network: baseNetwork });

				const response = await apiCall.put<UpdateDistributionCampaignDto>(
					route,
					distributionCampaign.id,
					updateDistributionCampaignDto,
				);

				expect(response.status).toBe(409);
			},
		);

		it("Should update a distribution-campaign that as a same value but for a different network", async () => {
			const duplicateName = "Test";
			const otherNetwork = await addNetworkToDB({ nestApp });
			await addDistributionCampaignToDB({ nestApp, name: duplicateName, network: otherNetwork });
			const distributionCampaign = await addDistributionCampaignToDB({ nestApp, network: baseNetwork });

			const response = await apiCall.put<UpdateDistributionCampaignDto>(route, distributionCampaign.id, {
				name: duplicateName,
			});

			expect(response.status).toBe(200);
		});

		it("Should update all values of a distribution-campaign ", async () => {
			const distributionCampaign = await addDistributionCampaignToDB({
				nestApp,
				network: baseNetwork,
			});

			const filters = createDataFilterMock();
			const networkOrganizationsIncludedIds = baseNetworkOrganizationsIncluded.map((item) => item.id);
			const contactsExcludedIds = baseContactsExcluded.map((item) => item.id);
			const correspondentsIncludedIds = baseCorrespondentsIncluded.map((item) => item.id);

			const updateDistributionCampaignDto: UpdateDistributionCampaignDto = updateDistributionCampaignMock({
				filters,
				networkOrganizationsIncludedIds,
				contactsExcludedIds,
				correspondentsIncludedIds,
			});

			const { status } = await apiCall.put<UpdateDistributionCampaignDto>(
				route,
				distributionCampaign.id,
				updateDistributionCampaignDto,
			);
			const response = await getDistributionCampaignFromDB({ nestApp, id: distributionCampaign.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateDistributionCampaignDto.name));
			expect(response.filters).toBeDefined();
			expect(response.contactsExcluded.length).toEqual(7);
			expect(response.networkOrganizationsIncluded.length).toEqual(10);
			expect(response.correspondentsIncluded.length).toEqual(5);
		});

		it("Should not set to null all editables values of a distribution-campaign", async () => {
			const distributionCampaign = await addDistributionCampaignToDB({
				nestApp,
				network: baseNetwork,
				contactsExcluded: baseContactsExcluded,
				correspondentsIncluded: baseCorrespondentsIncluded,
				networkOrganizationsIncluded: baseNetworkOrganizationsIncluded,
			});

			const updateDistributionCampaignDto: UpdateDistributionCampaignDto = {
				name: undefined,
				contactsExcludedIds: undefined,
				correspondentsIncludedIds: undefined,
				filters: undefined,
				networkOrganizationsIncludedIds: undefined,
			};
			const { status } = await apiCall.put<UpdateDistributionCampaignDto>(
				route,
				distributionCampaign.id,
				updateDistributionCampaignDto,
			);
			const response = await getDistributionCampaignFromDB({ nestApp, id: distributionCampaign.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.filters).toBeDefined();
			expect(response.contactsExcluded).toBeDefined();
			expect(response.networkOrganizationsIncluded).toBeDefined();
			expect(response.correspondentsIncluded).toBeDefined();
		});

		it("Should set to null all editables values of a distribution-campaign", async () => {
			const distributionCampaign = await addDistributionCampaignToDB({ nestApp, network: baseNetwork });

			const updateDistributionCampaignDto: UpdateDistributionCampaignDto = {
				name: null,
				contactsExcludedIds: null,
				correspondentsIncludedIds: null,
				filters: null,
				networkOrganizationsIncludedIds: null,
			};
			const { status } = await apiCall.put<UpdateDistributionCampaignDto>(
				route,
				distributionCampaign.id,
				updateDistributionCampaignDto,
			);
			const response = await getDistributionCampaignFromDB({ nestApp, id: distributionCampaign.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.filters).toEqual(null);
			expect(response.contactsExcluded).toEqual([]);
			expect(response.networkOrganizationsIncluded).toEqual([]);
			expect(response.correspondentsIncluded).toEqual([]);
		});
	});

	describe("DELETE DISTRIBUTION-CAMPAIGN - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a distribution-campaign that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a distribution-campaign", async () => {
			const distributionCampaign = await addDistributionCampaignToDB({ nestApp, network: baseNetwork });

			const { status } = await apiCall.delete(route, distributionCampaign.id);

			expect(status).toBe(200);
		});
	});

	describe("GET DISTRIBUTION-CAMPAIGN CORRESPONDENT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a list of correspondent - (/:id)", async () => {
			const distributionCampaign = await addDistributionCampaignToDB({
				nestApp,
				network: baseNetwork,
				contactsExcluded: baseContactsExcluded,
				correspondentsIncluded: baseCorrespondentsIncluded,
				networkOrganizationsIncluded: baseNetworkOrganizationsIncluded,
			});

			const { status, body } = await apiCall.get(route, distributionCampaign.id);

			expect(status).toBe(200);
			expect(body.data).toBeDefined();
			expect(body.total).toBeDefined();
			expect(body.count).toBeDefined();
			expect(body.limit).toBeDefined();
			expect(body.offset).toBeDefined();
			expect(body.offsetMax).toBeDefined();
			expect(body.data.length).toBeDefined();
		});
	});

	describe("GET DISTRIBUTION-CAMPAIGN EMAILS", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should return a list of emails - (/:id)", async () => {
			const distributionCampaign = await addDistributionCampaignToDB({
				nestApp,
				network: baseNetwork,
				contactsExcluded: baseContactsExcluded,
				correspondentsIncluded: baseCorrespondentsIncluded,
				networkOrganizationsIncluded: baseNetworkOrganizationsIncluded,
			});

			const { status, body } = await apiCall.get(route, `${distributionCampaign.id}/email`);

			expect(status).toBe(200);

			expect(body.total).toBeDefined();
			expect(body.count).toBeDefined();
		});
	});

	describe("GET DISTRIBUTION-CAMPAIGNS - (/network/:networkId)", () => {
		it("Should recover the list of distribution-campaign", async () => {
			const otherNetwork = await addNetworkToDB({ nestApp });

			await Promise.all([
				addManyDistributionCampaignToDB({
					nestApp,
					network: baseNetwork,
					contactsExcluded: baseContactsExcluded,
					correspondentsIncluded: baseCorrespondentsIncluded,
					networkOrganizationsIncluded: baseNetworkOrganizationsIncluded,
					numberOfRows: 10,
				}),
				addManyDistributionCampaignToDB({ nestApp, network: otherNetwork, numberOfRows: 20 }),
			]);

			const { status, body } = await apiCall.get(route, `network/${baseNetwork.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((distributionCampaign: IDistributionCampaignResponse) => {
				expect(distributionCampaign.network).toBeUndefined();
				expect(distributionCampaign.name).toBeDefined();
				expect(distributionCampaign.filters).toBeDefined();
			});
		});
	});
});
