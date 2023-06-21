import { INestApplication } from "@nestjs/common";
import { IOrganizationResponse } from "src/modules/organization/entity/organization.interface";
import { EFlagListValue } from "src/modules/list-value/entity/list-value.enum";
import { IListValueResponse } from "src/modules/list-value/entity/list-value.interface";
import { IExternalFamilyServiceResponse } from "src/modules/external-family-service/entity/external-family-service.interface";
import { IExternalServiceResponse } from "src/modules/external-service/entity/external-service.interface";
import {
	CreateExternalServiceOrganizationDto,
	UpdateExternalServiceOrganizationDto,
} from "src/modules/external-service-organization/dto";
import { IExternalServiceOrganizationResponse } from "src/modules/external-service-organization/entity/external-service-organization.interface";
import { ApiCall } from "./api-call.class";
import { closeTestAppConnexion, initializeTestApp } from "./config/e2e.config";

import { addOrganizationToDB } from "./mocks/organization.mock";
import { addListValueToDB } from "./mocks/list-value.mock";
import { addExternalFamilyServiceToDB } from "./mocks/external-family-service.mock";
import { addExternalServiceToDB } from "./mocks/external-service.mock";
import {
	addExternalServiceOrganizationToDB,
	addManyExternalServiceOrganizationToDB,
	createExternalServiceOrganizationMock,
	getExternalServiceOrganizationFromDB,
	updateExternalServiceOrganizationMock,
} from "./mocks/external-service-organization.mock";
import { addManyPeriodToDB, createManyPeriodMock } from "./mocks/period.mock";

describe("externalServiceOrganizationController (e2e)", () => {
	let nestApp: INestApplication;
	let route = "/external-service-organization";
	let apiCall: ApiCall;

	let baseListValue: IListValueResponse;
	let baseExternalFamilyService: IExternalFamilyServiceResponse;

	let baseExternalService: IExternalServiceResponse;
	let baseOrganization: IOrganizationResponse;

	beforeEach(async () => {
		nestApp = await initializeTestApp();
		[baseListValue, baseExternalFamilyService] = await Promise.all([
			addListValueToDB({ nestApp, flag: EFlagListValue.ORGANIZATION_TYPE }),
			addExternalFamilyServiceToDB({ nestApp }),
		]);

		[baseExternalService, baseOrganization] = await Promise.all([
			addExternalServiceToDB({ nestApp, externalFamilyService: baseExternalFamilyService }),
			addOrganizationToDB({ nestApp, type: baseListValue }),
		]);

		apiCall = new ApiCall(nestApp);
	});

	afterEach(async () => {
		await closeTestAppConnexion(nestApp);
	});

	describe("CREATE externalServiceOrganization - (/) - POST", () => {
		it("Should not create a externalServiceOrganization without the required values", async () => {
			const response = await apiCall.post(route, {});

			expect(response.status).toBe(400);
		});

		it("Should create an externalServiceOrganization", async () => {
			const historyMock = createManyPeriodMock({ nbOfRows: 11 });
			const createExternalServiceOrganizationDto: CreateExternalServiceOrganizationDto =
				createExternalServiceOrganizationMock({
					externalServiceId: baseExternalService.id,
					organizationId: baseOrganization.id,
					history: historyMock,
				});

			const response = await apiCall.post<CreateExternalServiceOrganizationDto>(
				route,
				createExternalServiceOrganizationDto,
			);

			expect(response.status).toBe(201);

			const { organization, externalService, history }: IExternalServiceOrganizationResponse = response.body;

			expect(organization.id).toEqual(createExternalServiceOrganizationDto.organizationId);
			expect(externalService.id).toEqual(createExternalServiceOrganizationDto.externalServiceId);
			expect(history.length).toEqual(historyMock.length);
		});
	});

	describe("UPDATE externalServiceOrganization - (/:id) - PUT", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.put(route, id, {});

			expect(status).toBe(400);
		});

		it("Should update all values of a externalServiceOrganization ", async () => {
			const newMockHistory = createManyPeriodMock({ nbOfRows: 7 });
			const externalServiceOrganization = await addExternalServiceOrganizationToDB({
				nestApp,
				externalService: baseExternalService,
				organization: baseOrganization,
			});

			const updateExternalServiceOrganizationDto: UpdateExternalServiceOrganizationDto =
				updateExternalServiceOrganizationMock({ history: newMockHistory });

			const { status } = await apiCall.put<UpdateExternalServiceOrganizationDto>(
				route,
				externalServiceOrganization.id,
				updateExternalServiceOrganizationDto,
			);
			const response = await getExternalServiceOrganizationFromDB({
				nestApp,
				id: externalServiceOrganization.id,
			});

			expect(status).toBe(200);

			expect(response.history.length).toEqual(newMockHistory.length);
		});

		it("Should set to null all optionals values of a externalServiceOrganization", async () => {
			const baseListPeriod = await addManyPeriodToDB({ nbOfRows: 9, nestApp });
			const externalServiceOrganization = await addExternalServiceOrganizationToDB({
				nestApp,
				externalService: baseExternalService,
				organization: baseOrganization,
				history: baseListPeriod,
			});

			const updateExternalServiceOrganizationDto: UpdateExternalServiceOrganizationDto = {
				history: null,
			};

			const { status } = await apiCall.put<UpdateExternalServiceOrganizationDto>(
				route,
				externalServiceOrganization.id,
				updateExternalServiceOrganizationDto,
			);
			const { history } = await getExternalServiceOrganizationFromDB({
				nestApp,
				id: externalServiceOrganization.id,
			});

			expect(status).toBe(200);

			expect(history).toBeDefined();
		});
	});

	describe("DELETE externalServiceOrganization - (/:id) - DELETE", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			// @ts-ignore
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should not delete a externalServiceOrganization that does not exist", async () => {
			const { status } = await apiCall.delete(route, "23a42931-1cba-48a0-b72b-fc427269a42d");

			expect(status).toBe(404);
		});

		it("Should delete a externalServiceOrganization", async () => {
			const externalServiceOrganization = await addExternalServiceOrganizationToDB({
				nestApp,
				externalService: baseExternalService,
				organization: baseOrganization,
			});

			const { status } = await apiCall.delete(route, externalServiceOrganization.id);

			expect(status).toBe(200);
		});
	});

	describe("GET externalServiceOrganization - GET", () => {
		it.each(["23a42931-1cba-48a0-b72b", 5874])("Should refuse invalid ID", async (id) => {
			const { status } = await apiCall.delete(route, id);

			expect(status).toBe(400);
		});

		it("Should find a externalServiceOrganization - (/:id)", async () => {
			const [otherexternalService, otherOrganization] = await Promise.all([
				addExternalServiceToDB({ nestApp, externalFamilyService: baseExternalFamilyService }),
				addOrganizationToDB({ nestApp, type: baseListValue }),
			]);

			const [externalServiceOrganization] = await Promise.all([
				addExternalServiceOrganizationToDB({
					nestApp,
					externalService: baseExternalService,
					organization: baseOrganization,
				}),
				addExternalServiceOrganizationToDB({
					nestApp,
					externalService: otherexternalService,
					organization: baseOrganization,
				}),
				addExternalServiceOrganizationToDB({
					nestApp,
					externalService: baseExternalService,
					organization: otherOrganization,
				}),
			]);

			const response = await apiCall.get(route, externalServiceOrganization.id);

			const { id, organization, externalService, history }: IExternalServiceOrganizationResponse = response.body;

			expect(id).toEqual(externalServiceOrganization.id);
			expect(organization).toBeDefined();
			expect(externalService).toBeDefined();
			expect(history).toBeDefined();
		});
	});

	describe("GET External-Service-Organization - (/) - GET LIST", () => {
		it("Should recover the list of externalServiceOrganizations by organization", async () => {
			const otherOrganization = await addOrganizationToDB({
				nestApp,
				type: baseListValue,
			});

			await Promise.all([
				addManyExternalServiceOrganizationToDB({
					nestApp,
					externalService: baseExternalService,
					organization: baseOrganization,
					numberOfRows: 10,
				}),
				addManyExternalServiceOrganizationToDB({
					nestApp,
					externalService: baseExternalService,
					organization: otherOrganization,
					numberOfRows: 20,
				}),
			]);
			const { status, body } = await apiCall.get(route, `organization/${baseOrganization.id}`);

			expect(status).toBe(200);

			expect(body.total).toEqual(10);
			expect(body.count).toEqual(10);
			expect(body.limit).toEqual(25);
			expect(body.offset).toEqual(0);
			expect(body.offsetMax).toEqual(0);
			expect(body.data.length).toEqual(10);

			body.data.forEach((externalServiceOrganization: IExternalServiceOrganizationResponse) => {
				expect(externalServiceOrganization.externalService).toBeDefined();
				expect(externalServiceOrganization.organization).toBeDefined();
				expect(externalServiceOrganization.history).toBeDefined();
			});
		});
	});
});
