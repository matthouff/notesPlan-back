import { INestApplication } from "@nestjs/common";
import { CreateParticipateDto, UpdateParticipateDto } from "src/modules/participate/dto";
import { IParticipateResponse } from "src/modules/participate/entity/participate.interface";
import { IServiceOrganizationResponse } from "src/modules/service-organization/entity/service-organization.interface";
import { ICorrespondentResponse } from "src/modules/correspondent/entity/correspondent.interface";
import { trimAndLowercase } from "@asrec/misc";
import { IJobResponse } from "src/modules/job/entity/job.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { IContactResponse } from "src/modules/contact/entity/contact.interface";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { IFamilyServiceResponse } from "src/modules/family-service/entity/family-service.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import {
	createParticipateMock,
	updateParticipateMock,
	addParticipateToDB,
	getParticipateFromDB,
	addManyParticipateToDB,
} from "./mocks/participate.mock";
import { addCorrespondentToDB } from "./mocks/correspondent.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addJobToDB } from "./mocks/job.mock";
import { addContactToDB } from "./mocks/contact.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addServiceOrganizationToDB } from "./mocks/service-organization.mock";
import { addFamilyServiceToDB } from "./mocks/family-service.mock";
import { addNetworkToDB } from "./mocks/network.mock";
import { addServiceToDB } from "./mocks/service.mock";

describe("ParticipateController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/participate";
	let apiCall: ApiCall;

	let baseJob: IJobResponse;
	let baseListValueOrg: IListValueResponse;
	let baseListValueCtc: IListValueResponse;
	let baseNetwork: INetworkResponse;

	let baseOrganization: IOrganizationResponse;
	let baseContact: IContactResponse;
	let baseFamilyService: IFamilyServiceResponse;

	let baseServiceOrganization: IServiceOrganizationResponse;
	let baseCorrespondent: ICorrespondentResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[baseJob, baseListValueOrg, baseListValueCtc, baseNetwork] = await Promise.all([
			addJobToDB({ nestApp }),
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY }),
			addNetworkToDB({ nestApp }),
		]);

		[baseOrganization, baseContact, baseFamilyService] = await Promise.all([
			addOrganizationToDB({ nestApp, type: baseListValueOrg }),
			addContactToDB({ nestApp, civility: baseListValueCtc }),
			addFamilyServiceToDB({ nestApp, network: baseNetwork }),
		]);

		const service = await addServiceToDB({ nestApp, familyService: baseFamilyService });

		baseCorrespondent = await addCorrespondentToDB({
			nestApp,
			job: baseJob,
			contact: baseContact,
			organization: baseOrganization,
		});
		baseServiceOrganization = await addServiceOrganizationToDB({
			nestApp,
			organization: baseOrganization,
			service,
		});

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE PARTICIPATE - (/) - POST", () => {
		it("Should not create a participate without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create a participate with only the required values", async () => {
			const createParticipateDto: CreateParticipateDto = createParticipateMock({
				correspondentId: baseCorrespondent.id,
				serviceOrganizationId: baseServiceOrganization.id,
			});

			const response = await apiCall.post<CreateParticipateDto>(route, {
				serviceOrganizationId: createParticipateDto.serviceOrganizationId,
				correspondentId: createParticipateDto.correspondentId,
				date: createParticipateDto.date,
			});
			expect(response.status).toBe(201);

			const { correspondent, serviceOrganization, date }: IParticipateResponse = response.body;

			expect(correspondent.id).toEqual(baseCorrespondent.id);
			expect(serviceOrganization.id).toEqual(baseServiceOrganization.id);
			expect(new Date(date).toLocaleDateString()).toEqual(createParticipateDto.date.toLocaleDateString());
		});

		it("Should create a participate", async () => {
			const createParticipateDto: CreateParticipateDto = createParticipateMock({
				correspondentId: baseCorrespondent.id,
				serviceOrganizationId: baseServiceOrganization.id,
			});

			const response = await apiCall.post<CreateParticipateDto>(route, createParticipateDto);
			expect(response.status).toBe(201);

			const { correspondent, serviceOrganization, date, comment }: IParticipateResponse = response.body;

			expect(correspondent.id).toEqual(baseCorrespondent.id);
			expect(serviceOrganization.id).toEqual(baseServiceOrganization.id);
			expect(new Date(date).toLocaleDateString()).toEqual(createParticipateDto.date.toLocaleDateString());
			expect(comment).toEqual(trimAndLowercase(comment));
		});

		it("Should not create a participate while receiving invalid data", async () => {
			const values = [
				{
					...createParticipateMock({
						correspondentId: baseCorrespondent.id,
						serviceOrganizationId: baseServiceOrganization.id,
					}),
					correspondentId: "0b688f31-6c34-4aed-8df",
				},
				{
					...createParticipateMock({
						correspondentId: baseCorrespondent.id,
						serviceOrganizationId: baseServiceOrganization.id,
					}),
					serviceOrganizationId: "b1bacada-48e7-489b-b",
				},
				{
					...createParticipateMock({
						correspondentId: baseCorrespondent.id,
						serviceOrganizationId: baseServiceOrganization.id,
					}),
					date: 4578567,
				},
				{
					...createParticipateMock({
						correspondentId: baseCorrespondent.id,
						serviceOrganizationId: baseServiceOrganization.id,
					}),
					comment: 85658,
				},
			];

			for await (const createParticipateDto of values) {
				const response = await apiCall.post(route, createParticipateDto);
				expect(response.status).toBe(400);
			}
		});
	});

	describe("UPDATE PARTICIPATE - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a participate ", async () => {
			const participate = await addParticipateToDB({
				nestApp,
				correspondent: baseCorrespondent,
				serviceOrganization: baseServiceOrganization,
			});

			const updateParticipateDto: UpdateParticipateDto = updateParticipateMock();

			const { status } = await apiCall.put<UpdateParticipateDto>(route, participate.id, updateParticipateDto);
			const response = await getParticipateFromDB({ nestApp, id: participate.id });

			expect(status).toBe(200);

			expect(response.correspondent.id).toEqual(participate.correspondent.id);
			expect(response.serviceOrganization.id).toEqual(participate.serviceOrganization.id);
			expect(new Date(response.date).toLocaleDateString()).toEqual(
				updateParticipateDto.date.toLocaleDateString(),
			);
			expect(response.comment).toEqual(trimAndLowercase(updateParticipateDto.comment));
		});

		it("Should not set to null all optionals values of a participate", async () => {
			const participate = await addParticipateToDB({
				nestApp,
				correspondent: baseCorrespondent,
				serviceOrganization: baseServiceOrganization,
			});
			const { status } = await apiCall.put<UpdateParticipateDto>(route, participate.id, {
				date: undefined,
				comment: undefined,
			});
			const response = await getParticipateFromDB({ nestApp, id: participate.id });

			expect(status).toBe(200);

			expect(response.correspondent).toBeDefined();
			expect(response.serviceOrganization).toBeDefined();
			expect(response.date).toBeDefined();
			expect(response.comment).toBeDefined();
		});

		it("Should set to null all optionals values of a participate", async () => {
			const participate = await addParticipateToDB({
				nestApp,
				correspondent: baseCorrespondent,
				serviceOrganization: baseServiceOrganization,
			});
			const { status } = await apiCall.put<UpdateParticipateDto>(route, participate.id, {
				comment: null,
			});
			const response = await getParticipateFromDB({ nestApp, id: participate.id });

			expect(status).toBe(200);

			expect(response.correspondent).toBeDefined();
			expect(response.serviceOrganization).toBeDefined();
			expect(response.date).toBeDefined();
			expect(response.comment).toEqual(null);
		});
	});

	describe("DELETE PARTICIPATE - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a participate that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a participate", async () => {
			const participate = await addParticipateToDB({
				nestApp,
				correspondent: baseCorrespondent,
				serviceOrganization: baseServiceOrganization,
			});

			const { status } = await apiCall.delete(route, participate.id);

			expect(status).toBe(200);
		});
	});

	describe("GET PARTICIPATE - (/:id) - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a participate", async () => {
			const participate = await addParticipateToDB({
				nestApp,
				correspondent: baseCorrespondent,
				serviceOrganization: baseServiceOrganization,
			});

			const response = await apiCall.get(route, participate.id);

			const { id, correspondent, serviceOrganization, date, comment }: IParticipateResponse = response.body;

			expect(id).toEqual(participate.id);
			expect(correspondent).toBeDefined();
			expect(serviceOrganization).toBeDefined();
			expect(date).toBeDefined();
			expect(comment).toBeDefined();
		});
	});

	describe("GET PARTICIPATES - (/) - GET", () => {
		it("Should find an empty list of values", async () => {
			const { status } = await apiCall.get(route, "correspondent/unknown");

			expect(status).toBe(400);
		});

		it("Should find a list of ORGANIZATION_TYPE values", async () => {
			const otherCorrespondent = await addCorrespondentToDB({
				nestApp,
				contact: baseContact,
				job: baseJob,
				organization: baseOrganization,
			});
			await Promise.all([
				addManyParticipateToDB({
					nestApp,
					correspondent: baseCorrespondent,
					serviceOrganization: baseServiceOrganization,
					numberOfRows: 10,
				}),
				addManyParticipateToDB({
					nestApp,
					correspondent: otherCorrespondent,
					serviceOrganization: baseServiceOrganization,
					numberOfRows: 20,
				}),
			]);

			const { status, body } = await apiCall.get(route, `correspondent/${baseCorrespondent.id}`);

			expect(status).toBe(200);
			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((participate: IParticipateResponse) => {
				expect(participate.correspondent).toBeDefined();
				expect(participate.serviceOrganization).toBeDefined();
				expect(participate.date).toBeDefined();
				expect(participate.comment).toBeDefined();
			});
		});
	});
});
