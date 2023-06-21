import { trimAndLowercase, trimAndUppercase } from "@asrec/misc";
import { INestApplication } from "@nestjs/common";
import { CreateNetworkDto, UpdateNetworkDto } from "src/modules/network/dto";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	addManyNetworkToDB,
	addNetworkToDB,
	createNetworkMock,
	getNetworkFromDB,
	updateNetworkMock,
} from "./mocks/network.mock";
import { getManyNetworkOrganizationByNetworkFromDB } from "./mocks/network-organization";
import { addManyOrganizationToDB, addOrganizationToDB } from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";

describe("NetworkController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/network";
	let apiCall: ApiCall;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE NETWORK - (/) - POST", () => {
		it("Should not create a network without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a network with only the required values", async () => {
			const createNetworkDto: CreateNetworkDto = createNetworkMock();

			const response = await apiCall.post<CreateNetworkDto>(route, { name: createNetworkDto.name });

			expect(response.status).toBe(201);

			const { name }: INetworkResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createNetworkDto.name));
		});

		it("Should create a network", async () => {
			const listValue = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });
			const [orgOne, orgSecond, orgThird] = await Promise.all([
				addOrganizationToDB({ nestApp, department: "37", type: listValue }),
				addOrganizationToDB({ nestApp, department: "75", type: listValue }),
				addOrganizationToDB({ nestApp, department: "18", type: listValue }),
				addOrganizationToDB({ nestApp, department: "88", type: listValue }),
			]);

			const createNetworkDto: CreateNetworkDto = createNetworkMock();

			const response = await apiCall.post<CreateNetworkDto>(route, {
				...createNetworkDto,
				departments: ["37", "75", "18", "19"],
			});

			expect(response.status).toBe(201);

			const { id, name, avatarUrl, color, address }: INetworkResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createNetworkDto.name));
			expect(avatarUrl).toEqual(createNetworkDto.avatarUrl);
			expect(color).toEqual(createNetworkDto.color);
			expect(address?.addressPart1).toEqual(trimAndUppercase(createNetworkDto.address.addressPart1));
			expect(address?.addressPart1).toEqual(trimAndUppercase(createNetworkDto.address.addressPart1));
			expect(address?.addressPart2).toEqual(trimAndUppercase(createNetworkDto.address.addressPart2));
			expect(address?.addressPart3).toEqual(trimAndUppercase(createNetworkDto.address.addressPart3));
			expect(address?.areaCode).toEqual(trimAndUppercase(createNetworkDto.address.areaCode));
			expect(address?.city).toEqual(trimAndUppercase(createNetworkDto.address.city));
			expect(address?.country).toEqual(trimAndUppercase(createNetworkDto.address.country));
			expect(address?.department).toEqual(trimAndUppercase(createNetworkDto.address.department));

			const listNetworkOrganization = await getManyNetworkOrganizationByNetworkFromDB({ nestApp, networkId: id });

			listNetworkOrganization.forEach((item) => {
				expect([orgOne.id, orgSecond.id, orgThird.id]).toContain(trimAndLowercase(item.organization.id));
			});
		});

		it.each([
			createNetworkMock({ name: "Test" }),
			createNetworkMock({ name: "test" }),
			createNetworkMock({ name: "TEST" }),
			createNetworkMock({ name: "tesT" }),
		])("Should not create a network that as a duplicate name", async (createNetworkDto) => {
			const duplicateName = "Test";
			await addNetworkToDB({ nestApp, name: duplicateName });

			const response = await apiCall.post<CreateNetworkDto>(route, createNetworkDto);
			expect(response.status).toBe(409);
		});

		it.each([
			{ ...createNetworkMock(), name: "" },
			{ ...createNetworkMock(), avatarUrl: "url" },
			{ ...createNetworkMock(), color: "color" },
		])("Should not create a network while receiving invalid data", async (createNetworkDto) => {
			const response = await apiCall.post(route, createNetworkDto);
			expect(response.status).toBe(400);
		});

		it("Should create a network, with a list of organizations linked to it", async () => {
			const type = await addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE });

			/** Ajout du parent dans le meme département que le network */
			const parentOrganization = await addOrganizationToDB({ nestApp, type, department: "37" });

			/**
			 * 	Ajout de 10 organisations "enfant" qui ne sont pas dans le meme département que le network
			 * Mais qui ont une organisation "parent" dans le même département que le network
			 */
			await addManyOrganizationToDB({
				nestApp,
				type,
				department: "75",
				numberOfRows: 10,
				subAgreement: parentOrganization,
			});

			/**
			 * Ajout de 10 organisations dans un département différent de celui du network
			 * et qui n'ont pas de parent
			 */
			await addManyOrganizationToDB({
				nestApp,
				type,
				department: "18",
				numberOfRows: 10,
			});

			/**
			 * Ajout de 10 organisations présentes dans le même département que celui du network
			 */
			await addManyOrganizationToDB({ nestApp, type, department: "37", numberOfRows: 10 });

			const createNetworkDto: CreateNetworkDto = createNetworkMock();

			const response = await apiCall.post<CreateNetworkDto>(route, {
				...createNetworkDto,
				departments: ["37"],
			});

			expect(response.status).toBe(201);

			const { name, id }: INetworkResponse = response.body;

			expect(name).toEqual(trimAndUppercase(createNetworkDto.name));

			const networkOrganizations = await getManyNetworkOrganizationByNetworkFromDB({
				nestApp,
				networkId: id,
			});

			expect(networkOrganizations.length).toEqual(21);
		});
	});

	describe("UPDATE NETWORK - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it.each([
			{ ...createNetworkMock(), name: "Test" },
			{ ...createNetworkMock(), name: "test" },
			{ ...createNetworkMock(), name: "TEST" },
			{ ...createNetworkMock(), name: "tesT" },
		])("Should not update a network that as a duplicate value", async (updateNetworkDto) => {
			const duplicateName = "Test";
			await addNetworkToDB({ nestApp, name: duplicateName });
			const network = await addNetworkToDB({ nestApp });

			const response = await apiCall.put<UpdateNetworkDto>(route, network.id, updateNetworkDto);

			expect(response.status).toBe(409);
		});

		it("Should update all values of a network ", async () => {
			const network = await addNetworkToDB({ nestApp });

			const updateNetworkDto: UpdateNetworkDto = updateNetworkMock();

			const { status } = await apiCall.put<UpdateNetworkDto>(route, network.id, updateNetworkDto);
			const response = await getNetworkFromDB({ nestApp, id: network.id });

			expect(status).toBe(200);

			expect(response.name).toEqual(trimAndUppercase(updateNetworkDto.name));
			expect(response.avatarUrl).toEqual(updateNetworkDto.avatarUrl);
			expect(response.color).toEqual(updateNetworkDto.color);
			expect(response.address?.addressPart1).toEqual(trimAndUppercase(updateNetworkDto.address.addressPart1));
			expect(response.address?.addressPart2).toEqual(trimAndUppercase(updateNetworkDto.address.addressPart2));
			expect(response.address?.addressPart3).toEqual(trimAndUppercase(updateNetworkDto.address.addressPart3));
			expect(response.address?.areaCode).toEqual(trimAndUppercase(updateNetworkDto.address.areaCode));
			expect(response.address?.city).toEqual(trimAndUppercase(updateNetworkDto.address.city));
			expect(response.address?.country).toEqual(trimAndUppercase(updateNetworkDto.address.country));
			expect(response.address?.department).toEqual(trimAndUppercase(updateNetworkDto.address.department));
		});

		it("Should not set to null all optionals values of a network", async () => {
			const network = await addNetworkToDB({ nestApp });

			const updateNetworkDto: UpdateNetworkDto = {
				name: undefined,
				avatarUrl: undefined,
				color: undefined,
			};
			const { status } = await apiCall.put<UpdateNetworkDto>(route, network.id, updateNetworkDto);
			const response = await getNetworkFromDB({ nestApp, id: network.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.avatarUrl).toBeDefined();
			expect(response.color).toBeDefined();
			expect(response.address).toBeDefined();
		});

		it("Should set to null all optionals values of a network", async () => {
			const network = await addNetworkToDB({ nestApp });

			const updateNetworkDto: UpdateNetworkDto = {
				name: null,
				avatarUrl: null,
				color: null,
				address: null,
			};
			const { status } = await apiCall.put<UpdateNetworkDto>(route, network.id, updateNetworkDto);
			const response = await getNetworkFromDB({ nestApp, id: network.id });

			expect(status).toBe(200);

			expect(response.name).toBeDefined();
			expect(response.avatarUrl).toBeNull();
			expect(response.color).toBeNull();
			expect(response.address).toBeNull();
		});
	});

	describe("DELETE NETWORK - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a network that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a network", async () => {
			const network = await addNetworkToDB({ nestApp });

			const { status } = await apiCall.delete(route, network.id);

			expect(status).toBe(200);
		});
	});

	describe("GET NETWORK - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a network", async () => {
			const network = await addNetworkToDB({ nestApp });

			const response = await apiCall.get(route, network.id);

			const { id, name, avatarUrl, color }: INetworkResponse = response.body;

			expect(id).toEqual(network.id);
			expect(name).toBeDefined();
			expect(avatarUrl).toBeDefined();
			expect(color).toBeDefined();
			expect(network.address).toBeDefined();
		});
	});

	describe("GET NETWORKS - (/) - GET", () => {
		it("Should recover the list of networks", async () => {
			await addManyNetworkToDB({ nestApp, numberOfRows: 10 });

			const { status, body } = await apiCall.get(route);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((network: INetworkResponse) => {
				expect(network.name).toBeDefined();
				expect(network.avatarUrl).toBeDefined();
				expect(network.color).toBeDefined();
				expect(network.address).toBeDefined();
			});
		});
	});
});
