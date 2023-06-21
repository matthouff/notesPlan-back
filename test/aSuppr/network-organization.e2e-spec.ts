import { trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { CreateNetworkOrganizationDto, UpdateNetworkOrganizationDto } from "src/modules/network-organization/dto";
import { INetworkOrganizationResponse } from "src/modules/network-organization/entity/network-organization.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addNetworkToDB } from "./mocks/network.mock";
import {
	createNetworkOrganizationMock,
	addNetworkOrganizationToDB,
	updateNetworkOrganizationMock,
	getNetworkOrganizationFromDB,
} from "./mocks/network-organization";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";

describe("NetworkOrganizationController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/network-organization";
	let apiCall: ApiCall;

	let networkDB: INetworkResponse;
	let organizationDB: IOrganizationResponse;
	let baseListValue: IListValueResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();
		baseListValue = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });

		[networkDB, organizationDB] = await Promise.all([
			addNetworkToDB({ nestApp }),
			addOrganizationToDB({ nestApp, type: baseListValue }),
		]);

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE NetworkOrganization - (/) - POST", () => {
		it("Should not create a NetworkOrganization without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a NetworkOrganization with only the required values", async () => {
			const createNetworkOrganizationDto: CreateNetworkOrganizationDto = createNetworkOrganizationMock({
				networkId: networkDB.id,
				organizationId: organizationDB.id,
			});

			const response = await apiCall.post<CreateNetworkOrganizationDto>(route, {
				organizationId: createNetworkOrganizationDto.organizationId,
				networkId: createNetworkOrganizationDto.networkId,
				code: createNetworkOrganizationDto.code,
			});

			expect(response.status).toBe(201);

			const { organization, network }: INetworkOrganizationResponse = response.body;

			expect(organization.id).toEqual(createNetworkOrganizationDto.organizationId);
			expect(network.id).toEqual(createNetworkOrganizationDto.networkId);
		});

		it("Should create a NetworkOrganization", async () => {
			const createNetworkOrganizationDto: CreateNetworkOrganizationDto = createNetworkOrganizationMock({
				networkId: networkDB.id,
				organizationId: organizationDB.id,
			});

			const response = await apiCall.post<CreateNetworkOrganizationDto>(route, createNetworkOrganizationDto);

			expect(response.status).toBe(201);

			const { organization, network, code, subAccount, prospect }: INetworkOrganizationResponse = response.body;

			expect(organization.id).toEqual(createNetworkOrganizationDto.organizationId);
			expect(network.id).toEqual(createNetworkOrganizationDto.networkId);
			expect(code).toEqual(trimAndUppercase(createNetworkOrganizationDto.code));
			expect(subAccount).toEqual(createNetworkOrganizationDto.subAccount);
			expect(prospect).toEqual(createNetworkOrganizationDto.prospect);
		});

		it("Should create a NetworkOrganization with default values", async () => {
			const createNetworkOrganizationDto: CreateNetworkOrganizationDto = createNetworkOrganizationMock({
				networkId: networkDB.id,
				organizationId: organizationDB.id,
			});

			const response = await apiCall.post<CreateNetworkOrganizationDto>(route, {
				...createNetworkOrganizationDto,
				prospect: undefined,
			});

			expect(response.status).toBe(201);

			const { prospect }: INetworkOrganizationResponse = response.body;

			expect(prospect).toBeFalsy();
		});

		it("Should create a NetworkOrganization with distance calculated", async () => {
			const [newNetwork, newOrg] = await Promise.all([
				addNetworkToDB({
					nestApp,
					address: {
						addressPart1: "33 rue Blaise Pascal",
						city: "TOURS",
						areaCode: "37000",
						department: "37",
					},
				}),
				addOrganizationToDB({
					nestApp,
					type: baseListValue,
					address: {
						addressPart1: "76 Rue des Saints-Pères",
						city: "PARIS",
						areaCode: "75007",
					},
				}),
			]);

			const createNetworkOrganizationDto: CreateNetworkOrganizationDto = createNetworkOrganizationMock({
				networkId: newNetwork.id,
				organizationId: newOrg.id,
			});

			const response = await apiCall.post<CreateNetworkOrganizationDto>(route, {
				...createNetworkOrganizationDto,
				prospect: undefined,
			});

			expect(response.status).toBe(201);

			const { distance }: INetworkOrganizationResponse = response.body;

			expect(distance).toEqual(237);
		});
	});

	describe("UPDATE NetworkOrganization - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a NetworkOrganization ", async () => {
			const networkOrganization = await addNetworkOrganizationToDB({
				nestApp,
				network: networkDB,
				organization: organizationDB,
			});

			const updateNetworkOrganizationDto: UpdateNetworkOrganizationDto = updateNetworkOrganizationMock();

			const { status } = await apiCall.put<UpdateNetworkOrganizationDto>(
				route,
				networkOrganization.id,
				updateNetworkOrganizationDto,
			);
			const response = await getNetworkOrganizationFromDB({ nestApp, id: networkOrganization.id });

			expect(status).toBe(200);

			expect(response.code).toEqual(trimAndUppercase(updateNetworkOrganizationDto.code));
			expect(response.subAccount).toEqual(updateNetworkOrganizationDto.subAccount);
			expect(response.prospect).toEqual(updateNetworkOrganizationDto.prospect);
			expect(response.distance).toEqual(updateNetworkOrganizationDto.distance);
		});

		it("Should not set to null all optionals values of a NetworkOrganization", async () => {
			const networkOrganization = await addNetworkOrganizationToDB({
				nestApp,
				network: networkDB,
				organization: organizationDB,
			});

			const updateNetworkOrganizationDto: UpdateNetworkOrganizationDto = {
				subAccount: undefined,
			};

			const { status } = await apiCall.put<UpdateNetworkOrganizationDto>(
				route,
				networkOrganization.id,
				updateNetworkOrganizationDto,
			);
			const response = await getNetworkOrganizationFromDB({ nestApp, id: networkOrganization.id });

			expect(status).toBe(200);
			expect(response.subAccount).toBeDefined();
			expect(response.distance).toBeDefined();
		});

		it("Should set to null all optionals values of a NetworkOrganization", async () => {
			const networkOrganization = await addNetworkOrganizationToDB({
				nestApp,
				network: networkDB,
				organization: organizationDB,
			});

			const updateNetworkOrganizationDto: UpdateNetworkOrganizationDto = { subAccount: null, distance: null };

			const { status } = await apiCall.put<UpdateNetworkOrganizationDto>(
				route,
				networkOrganization.id,
				updateNetworkOrganizationDto,
			);
			const { subAccount, distance } = await getNetworkOrganizationFromDB({
				nestApp,
				id: networkOrganization.id,
			});

			expect(status).toBe(200);

			expect(subAccount).toBeNull();
			expect(distance).toBeNull();
		});
	});

	describe("DELETE NetworkOrganization - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a NetworkOrganization that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a NetworkOrganization", async () => {
			const networkOrganization = await addNetworkOrganizationToDB({
				nestApp,
				network: networkDB,
				organization: organizationDB,
			});

			const { status } = await apiCall.delete(route, networkOrganization.id);

			expect(status).toBe(200);
		});
	});

	describe("GET NetworkOrganization - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a NetworkOrganization - (/:id)", async () => {
			const [otherNetwork, otherOrganization] = await Promise.all([
				addNetworkToDB({ nestApp }),
				addOrganizationToDB({ nestApp, type: baseListValue }),
			]);

			const [networkOrganization] = await Promise.all([
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: organizationDB,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: otherNetwork,
					organization: organizationDB,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: otherOrganization,
				}),
			]);

			const response = await apiCall.get(route, networkOrganization.id);

			const { id, organization, network, code, subAccount, distance }: INetworkOrganizationResponse =
				response.body;

			expect(id).toEqual(networkOrganization.id);
			expect(organization).toBeDefined();
			expect(network).toBeDefined();
			expect(code).toBeDefined();
			expect(subAccount).toBeDefined();
			expect(distance).toBeDefined();
		});

		it("Should find a NetworkOrganization - (/organization/:organizationId/network/:networkId)", async () => {
			const [otherNetwork, otherOrganization] = await Promise.all([
				addNetworkToDB({ nestApp }),
				addOrganizationToDB({ nestApp, type: baseListValue }),
			]);

			const [networkOrganization] = await Promise.all([
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: organizationDB,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: otherNetwork,
					organization: organizationDB,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: otherOrganization,
				}),
			]);

			const response = await apiCall.get(route, `organization/${organizationDB.id}/network/${networkDB.id}`);

			const { id, organization, network, code, subAccount, prospect, distance }: INetworkOrganizationResponse =
				response.body;

			expect(id).toEqual(networkOrganization.id);
			expect(organization).toBeUndefined();
			expect(network).toBeUndefined();
			expect(code).toBeDefined();
			expect(prospect).toBeDefined();
			expect(subAccount).toBeDefined();
			expect(distance).toBeDefined();
		});

		it("Should find a NetworkOrganization by subagreement and networkId - (/sub-agreement/network/:networkId)", async () => {
			const [otherNetwork, otherOrganization] = await Promise.all([
				addNetworkToDB({ nestApp }),
				addOrganizationToDB({ nestApp, type: baseListValue, subAgreement: organizationDB }),
				addOrganizationToDB({ nestApp, type: baseListValue, subAgreement: organizationDB }),
			]);

			await Promise.all([
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: organizationDB,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: otherNetwork,
					organization: organizationDB,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: otherNetwork,
					organization: otherOrganization,
				}),
			]);

			const { body, status } = await apiCall.get(route, `sub-agreement/network/${networkDB.id}`);

			expect(status).toBe(200);
			expect(body.total).toEqual(2);
			expect(body.count).toEqual(2);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(2);

			for (let i = 0; i < body.data.length; i += 1) {
				const elt: INetworkOrganizationResponse = body.data[i];

				expect(elt.organization.address).toBeDefined();
			}
		});

		it("Should find a NetworkOrganization by subagreement and organizationId and networkId - (sub-agreement/organization/:organizationId/network/:networkId)", async () => {
			const organization = await addOrganizationToDB({
				nestApp,
				type: baseListValue,
				subAgreement: organizationDB,
			});

			await Promise.all([
				// ajout de 10 networks-organization contenant des organisations enfant + networkDB
				addNetworkOrganizationToDB({ nestApp, network: networkDB, organization, numberOfRows: 10 }),
				addOrganizationToDB({ nestApp, type: baseListValue, subAgreement: organizationDB }),
			]);

			const { body, status } = await apiCall.get(
				route,
				`sub-agreement/organization/${organizationDB.id}/network/${networkDB.id}`,
			);

			expect(status).toBe(200);
			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			for (let i = 0; i < body.data.length; i += 1) {
				const elt: INetworkOrganizationResponse = body.data[i];

				expect(elt.organization.address).toBeDefined();
			}
		});
	});

	describe("GET Network-Organization - (/) - GET", () => {
		it("Should recover the list of NetworkOrganizations by network", async () => {
			const otherNetwork = await addNetworkToDB({ nestApp });

			await Promise.all([
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: organizationDB,
					numberOfRows: 10,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: otherNetwork,
					organization: organizationDB,
					numberOfRows: 20,
				}),
			]);
			const { status, body } = await apiCall.get(route, `network/${networkDB.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((networkOrganization: INetworkOrganizationResponse) => {
				expect(networkOrganization.network).toBeUndefined();
				expect(networkOrganization.organization).toBeDefined();
				expect(networkOrganization.organization.address).toBeDefined();
				expect(networkOrganization.organization.tutelle).toBeDefined();
				expect(networkOrganization.organization.diocese).toBeDefined();
				expect(networkOrganization.code).toBeDefined();
				expect(networkOrganization.subAccount).toBeDefined();
				expect(networkOrganization.distance).toBeDefined();
			});
		});

		it("Should recover the list of Network-Organization by organization", async () => {
			const otherOrganization = await addOrganizationToDB({ nestApp, type: baseListValue });

			await Promise.all([
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: organizationDB,
					numberOfRows: 10,
				}),
				addNetworkOrganizationToDB({
					nestApp,
					network: networkDB,
					organization: otherOrganization,
					numberOfRows: 20,
				}),
			]);

			const { status, body } = await apiCall.get(route, `organization/${organizationDB.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((networkOrganization: INetworkOrganizationResponse) => {
				expect(networkOrganization.organization).toBeUndefined();
				expect(networkOrganization.network).toBeDefined();
				expect(networkOrganization.code).toBeDefined();
				expect(networkOrganization.subAccount).toBeDefined();
				expect(networkOrganization.distance).toBeDefined();
			});
		});
	});
});
