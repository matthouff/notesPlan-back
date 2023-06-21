import { INestApplication } from "@nestjs/common";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { INetworkOrganizationResponse } from "src/modules/network-organization/entity/network-organization.interface";
import { ICorrespondentResponse } from "src/modules/correspondent/entity/correspondent.interface";
import { IServiceOrganizationResponse } from "src/modules/service-organization/entity/service-organization.interface";
import { IWorkflowResponse } from "src/modules/workflow/entity/workflow.interface";
import { INetworkResponse } from "src/modules/network/entity/network.interface";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { IContactResponse } from "src/modules/contact/entity/contact.interface";
import { IJobResponse } from "src/modules/job/entity/job.interface";
import { IServiceResponse } from "src/modules/service/entity/service.interface";
import { IFamilyServiceResponse } from "src/modules/family-service/entity/family-service.interface";
import { CreateQuotationDto, UpdateQuotationDto } from "src/modules/quotation/dto";
import { IQuotationResponse } from "src/modules/quotation/entity/quotation.interface";
import { trimAndLowercase } from "@asrec/misc";
import { ETypeWorkflow } from "src/modules/workflow/entity/type-workflow.enum";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addNetworkOrganizationToDB } from "./mocks/network-organization";
import { addNetworkToDB } from "./mocks/network.mock";
import { addOrganizationToDB } from "./mocks/organization.mock";
import { addCorrespondentToDB } from "./mocks/correspondent.mock";
import { addContactToDB } from "./mocks/contact.mock";
import { addJobToDB } from "./mocks/job.mock";
import { addServiceOrganizationToDB } from "./mocks/service-organization.mock";
import { addServiceToDB } from "./mocks/service.mock";
import { addFamilyServiceToDB } from "./mocks/family-service.mock";
import { addWorkflowToDB } from "./mocks/workflow.mock";
import {
	addManyQuotationToDB,
	addQuotationToDB,
	createQuotationMock,
	getQuotationFromDB,
	updateQuotationMock,
} from "./mocks/quotation.mock";
import { getRandomEnumValue } from "./mocks/utils";

describe("QuotationController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/quotation";
	let apiCall: ApiCall;

	let baseNetwork: INetworkResponse;
	let baseOrganization: IOrganizationResponse;
	let baseContact: IContactResponse;
	let baseJob: IJobResponse;
	let baseFamilyService: IFamilyServiceResponse;
	let baseService: IServiceResponse;

	let baseNetworkOrganization: INetworkOrganizationResponse;
	let baseCorrespondent: ICorrespondentResponse;
	let baseServiceOrganization: IServiceOrganizationResponse;
	let baseListValueOrg: IListValueResponse;
	let baseListValueCtc: IListValueResponse;
	let baseListValueQtn: IListValueResponse;
	let baseWorkflow: IWorkflowResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();

		[baseListValueOrg, baseListValueCtc, baseListValueQtn, baseNetwork, baseJob] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addListValueToDB({ nestApp, flag: EFlagListValue.CONTACT_CIVILITY }),
			addListValueToDB({ nestApp, flag: EFlagListValue.QUOTATION_TYPE }),
			addNetworkToDB({ nestApp }),
			addJobToDB({ nestApp }),
		]);

		[baseOrganization, baseContact, baseFamilyService, baseWorkflow] = await Promise.all([
			addOrganizationToDB({ nestApp, type: baseListValueOrg }),
			addContactToDB({ nestApp, civility: baseListValueCtc }),
			addFamilyServiceToDB({ nestApp, network: baseNetwork }),
			addWorkflowToDB({ nestApp, network: baseNetwork, type: ETypeWorkflow.DEVIS }),
		]);

		[baseService, baseNetworkOrganization, baseCorrespondent] = await Promise.all([
			addServiceToDB({ nestApp, familyService: baseFamilyService }),
			addNetworkOrganizationToDB({
				nestApp,
				network: baseNetwork,
				organization: baseOrganization,
			}),
			addCorrespondentToDB({
				nestApp,
				organization: baseOrganization,
				contact: baseContact,
				job: baseJob,
			}),
		]);

		baseServiceOrganization = await addServiceOrganizationToDB({
			nestApp,
			organization: baseOrganization,
			service: baseService,
		});

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("POST", () => {
		describe("CREATE", () => {
			it("400 - Should not accept empty body", async () => {
				const response = await apiCall.post(route, {});

				expect(response.status).toBe(400);
			});

			it("200 - Should create successfully", async () => {
				const createQuotationDto: CreateQuotationDto = createQuotationMock({
					networkOrganizationId: baseNetworkOrganization.id,
					correspondentId: baseCorrespondent.id,
					serviceOrganizationId: baseServiceOrganization.id,
					typeId: baseListValueQtn.id,
					workflowId: baseWorkflow.id,
				});

				const response = await apiCall.post<CreateQuotationDto>(route, createQuotationDto);
				expect(response.status).toBe(201);

				const {
					id,
					code,
					status,
					comment,
					networkOrganization,
					correspondent,
					link,
					serviceOrganization,
					workflowProgress,
					type,
				}: IQuotationResponse = response.body;

				expect(id).toBeDefined();
				expect(code).toEqual(createQuotationDto.code);
				expect(comment).toEqual(trimAndLowercase(createQuotationDto.comment));
				expect(status).toEqual(createQuotationDto.status);
				expect(link).toEqual(createQuotationDto.link);
				expect(networkOrganization.id).toEqual(createQuotationDto.networkOrganizationId);
				expect(correspondent.id).toEqual(createQuotationDto.correspondentId);
				expect(serviceOrganization.id).toEqual(createQuotationDto.serviceOrganizationId);
				expect(workflowProgress).toBeDefined();
				expect(type.id).toEqual(createQuotationDto.typeId);
			});

			it("200 - Should create successfully with only the mandatory data", async () => {
				const createQuotationDto: CreateQuotationDto = createQuotationMock({
					networkOrganizationId: baseNetworkOrganization.id,
				});

				const response = await apiCall.post<CreateQuotationDto>(route, {
					code: createQuotationDto.code,
					networkOrganizationId: createQuotationDto.networkOrganizationId,
					status: createQuotationDto.status,
				});
				expect(response.status).toBe(201);

				const { networkOrganization, code, status }: IQuotationResponse = response.body;

				expect(status).toEqual(createQuotationDto.status);
				expect(code).toEqual(createQuotationDto.code);
				expect(networkOrganization.id).toEqual(createQuotationDto.networkOrganizationId);
			});

			it("409 - Should not accept a code that is already used", async () => {
				await addQuotationToDB({ nestApp, code: "Test", networkOrganization: baseNetworkOrganization });

				const values = [
					createQuotationMock({ code: "Test", networkOrganizationId: baseNetworkOrganization.id }),
					createQuotationMock({ code: "test", networkOrganizationId: baseNetworkOrganization.id }),
					createQuotationMock({ code: "TEST", networkOrganizationId: baseNetworkOrganization.id }),
					createQuotationMock({ code: "tesT", networkOrganizationId: baseNetworkOrganization.id }),
				];

				for await (const createQuotationDto of values) {
					const response = await apiCall.post<CreateQuotationDto>(route, createQuotationDto);
					expect(response.status).toBe(409);
				}
			});

			it("403 - Should not accept a Workflow which hasn't the excepted type", async () => {
				const invalidWorkflow = await addWorkflowToDB({
					nestApp,
					network: baseNetwork,
					type: getRandomEnumValue(ETypeWorkflow, [ETypeWorkflow.DEVIS]),
				});

				const createQuotationDto = createQuotationMock({
					networkOrganizationId: baseNetworkOrganization.id,
					workflowId: invalidWorkflow.id,
				});

				const response = await apiCall.post<CreateQuotationDto>(route, createQuotationDto);
				expect(response.status).toBe(403);
			});

			it("400 - Should not accept invalid data", async () => {
				const values = [
					{ ...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }), code: "" },
					{ ...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }), status: "ENUM" },
					{
						...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }),
						networkOrganizationId: "708edbdf-48d9-4ed5-baf8-4db51e0a",
					},
					{
						...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }),
						correspondentId: "708edbdf-48d9-4ed5-baf8-4db51e0a",
					},
					{
						...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }),
						typeId: "708edbdf-48d9-4ed5-baf8-4db51e0a",
					},
					{
						...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }),
						serviceOrganizationId: "708edbdf-48d9-4ed5-baf8-4db51e0a",
					},
					{
						...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }),
						link: "url-invalid",
					},
					{
						...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }),
						workflowId: "708edbdf-48d9-4ed5-baf8-4db51e0a",
					},
					{ ...createQuotationMock({ networkOrganizationId: baseNetworkOrganization.id }), comment: 656 },
				];

				for await (const createQuotationDto of values) {
					const response = await apiCall.post(route, createQuotationDto);
					expect(response.status).toBe(400);
				}
			});
		});
	});

	describe("PUT", () => {
		describe("UPDATE", () => {
			it("400 - Should not accept a value that is not a UUID", async () => {
				const values = ["23a42931-1cba-48a0-b72b", 5874];

				for await (const id of values) {
					const { status } = await apiCall.put(route, id, {});

					expect(status).toBe(400);
				}
			});

			it("409 - Should not accept a code that is already used", async () => {
				await addQuotationToDB({ nestApp, code: "Test", networkOrganization: baseNetworkOrganization });
				const quotation = await addQuotationToDB({ nestApp, networkOrganization: baseNetworkOrganization });

				const values = [
					updateQuotationMock({ code: "Test" }),
					updateQuotationMock({ code: "test" }),
					updateQuotationMock({ code: "TEST" }),
					updateQuotationMock({ code: "tesT" }),
				];

				for await (const updateQuotationDto of values) {
					const response = await apiCall.put<UpdateQuotationDto>(route, quotation.id, updateQuotationDto);

					expect(response.status).toBe(409);
				}

				const response = await apiCall.put<UpdateQuotationDto>(route, quotation.id, {
					code: "UNEXISTING CODE",
				});
				expect(response.status).toBe(200);
			});

			it("200 - Should update all the values", async () => {
				const quotation = await addQuotationToDB({
					nestApp,
					networkOrganization: baseNetworkOrganization,
				});

				const updateQuotationDto: UpdateQuotationDto = updateQuotationMock({
					correspondentId: baseCorrespondent.id,
					serviceOrganizationId: baseServiceOrganization.id,
					typeId: baseListValueQtn.id,
				});

				const response = await apiCall.put<UpdateQuotationDto>(route, quotation.id, updateQuotationDto);
				const get = await getQuotationFromDB({ nestApp, id: quotation.id });

				expect(response.status).toBe(200);

				const {
					id,
					code,
					status,
					comment,
					networkOrganization,
					correspondent,
					link,
					serviceOrganization,
					workflowProgress,
					type,
				}: IQuotationResponse = get;

				expect(id).toBeDefined();
				expect(code).toEqual(updateQuotationDto.code);
				expect(comment).toEqual(trimAndLowercase(updateQuotationDto.comment));
				expect(status).toEqual(updateQuotationDto.status);
				expect(link).toEqual(updateQuotationDto.link);
				expect(networkOrganization.id).toBeDefined();
				expect(correspondent.id).toEqual(updateQuotationDto.correspondentId);
				expect(serviceOrganization.id).toEqual(updateQuotationDto.serviceOrganizationId);
				expect(workflowProgress).toBeDefined();
				expect(type.id).toEqual(updateQuotationDto.typeId);
			});

			it("200 - Should set to null only the nullable values", async () => {
				const quotation = await addQuotationToDB({
					nestApp,
					networkOrganization: baseNetworkOrganization,
					correspondent: baseCorrespondent,
					serviceOrganization: baseServiceOrganization,
					type: baseListValueQtn,
				});

				const updateQuotationDto: UpdateQuotationDto = {
					code: null,
					comment: null,
					correspondentId: null,
					link: null,
					serviceOrganizationId: null,
					status: null,
					typeId: null,
				};
				const response = await apiCall.put<UpdateQuotationDto>(route, quotation.id, updateQuotationDto);
				const get = await getQuotationFromDB({ nestApp, id: quotation.id });

				expect(response.status).toBe(200);

				const {
					id,
					code,
					status,
					comment,
					networkOrganization,
					correspondent,
					link,
					serviceOrganization,
					type,
				}: IQuotationResponse = get;

				expect(id).toBeDefined();
				expect(code).toBeDefined();
				expect(comment).toEqual(null);
				expect(status).toBeDefined();
				expect(link).toEqual(null);
				expect(networkOrganization).toBeDefined();
				expect(correspondent).toEqual(null);
				expect(serviceOrganization).toEqual(null);
				expect(type).toEqual(null);
			});
		});
	});

	describe("GET", () => {
		describe("FIND", () => {
			describe(" (/) ", () => {
				it("400 - Should not accept a value that is not a UUID", async () => {
					const values = ["23a42931-1cba-48a0-b72b", 5874];

					for await (const id of values) {
						const { status } = await apiCall.get(route, id);

						expect(status).toBe(400);
					}
				});

				it("200 - Should send back the item", async () => {
					const quotation = await addQuotationToDB({
						nestApp,
						networkOrganization: baseNetworkOrganization,
						correspondent: baseCorrespondent,
						serviceOrganization: baseServiceOrganization,
						type: baseListValueQtn,
						workflow: baseWorkflow,
					});

					const response = await apiCall.get(route, quotation.id);

					expect(response.status).toBe(200);

					const {
						id,
						code,
						status,
						comment,
						networkOrganization,
						correspondent,
						link,
						serviceOrganization,
						workflowProgress,
						type,
					}: IQuotationResponse = response.body;

					expect(id).toBeDefined();
					expect(code).toBeDefined();
					expect(comment).toBeDefined();
					expect(status).toBeDefined();
					expect(link).toBeDefined();
					expect(networkOrganization).toBeDefined();
					expect(correspondent).toBeDefined();
					expect(serviceOrganization).toBeDefined();
					expect(workflowProgress).toBeDefined();
					expect(type).toBeDefined();
				});
			});
		});

		describe("LIST", () => {
			describe("(/network-organization/:networkOrganizationId)", () => {
				it("400 - Should not accept a value that is not a UUID", async () => {
					const values = ["23a42931-1cba-48a0-b72b", 5874];

					for await (const id of values) {
						const { status } = await apiCall.get(route, `network-organization/${id}`);

						expect(status).toBe(400);
					}
				});

				it("200 - Should send back the list of items with pagination informations", async () => {
					const [otherNetworkOrganization] = await Promise.all([
						addNetworkOrganizationToDB({
							nestApp,
							network: baseNetwork,
							organization: baseOrganization,
						}),
						addManyQuotationToDB({
							nestApp,
							numberOfRows: 10,
							networkOrganization: baseNetworkOrganization,
						}),
					]);
					await addManyQuotationToDB({
						nestApp,
						numberOfRows: 20,
						networkOrganization: otherNetworkOrganization,
					});

					const response = await apiCall.get(route, `network-organization/${baseNetworkOrganization.id}`);

					expect(response.status).toBe(200);
					expect(response.body.total).toEqual(10);
					expect(response.body.count).toEqual(10);
					expect(response.body.limit).toEqual(25);
					expect(response.body.offset).toEqual(0);
					expect(response.body.offsetMax).toEqual(0);
					expect(response.body.data.length).toEqual(10);

					response.body.data.forEach((quotation: IQuotationResponse) => {
						const {
							id,
							code,
							status,
							comment,
							networkOrganization,
							correspondent,
							link,
							serviceOrganization,
							workflowProgress,
							type,
						}: IQuotationResponse = quotation;

						expect(id).toBeDefined();
						expect(code).toBeDefined();
						expect(comment).toBeDefined();
						expect(status).toBeDefined();
						expect(link).toBeDefined();
						expect(networkOrganization).toBeUndefined();
						expect(correspondent).toBeDefined();
						expect(serviceOrganization).toBeDefined();
						expect(workflowProgress).toBeDefined();
						expect(type).toBeDefined();
					});
				});
			});
		});
	});

	describe("DELETE", () => {
		describe("(/:id)", () => {
			it("400 - Should not accept a value that is not a UUID", async () => {
				const values = ["23a42931-1cba-48a0-b72b", 5874];

				for await (const id of values) {
					const { status } = await apiCall.delete(route, id);

					expect(status).toBe(400);
				}
			});

			it("404 - Should returns an error when no occurence have been found for this UUID", async () => {
				const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

				expect(status).toBe(404);
			});

			it("200 - Should send nothing when the value have been found and deleted successfully", async () => {
				const quotation = await addQuotationToDB({ nestApp, networkOrganization: baseNetworkOrganization });

				const { status } = await apiCall.delete(route, quotation.id);

				expect(status).toBe(200);
			});
		});
	});
});
