import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import labelsServiceMock from './mock/labelServiceMock';
import { LabelService } from 'src/modules/labels/labels.service';

describe('labelslabelsController (e2e)', () => {
  let app: INestApplication;
  let createdlabelId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: LabelService,
          useClass: labelsServiceMock, // Utilisez le mock du service des labels
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/labels (GET) - should return all labels', async () => {
    return await request(app.getHttpServer()).get('/labels').expect(200).expect((response) => {
      const labels = response.body;
      expect(Array.isArray(labels)).toBe(true);
    });

  });

  it('/labels (POST) - should create a new label', () => {
    const newLabel = { la_libelle: 'New label' };
    return request(app.getHttpServer())
      .post('/labels')
      .send(newLabel)
      .expect(201)
      .expect((response) => {
        const createdlabel = response.body;
        expect(createdlabel.la_libelle).toBe(newLabel.la_libelle);
        createdlabelId = createdlabel.id;
      });
  });

  it('/labels/:id (GET) - should return a specific label', async () => {
    return await request(app.getHttpServer())
      .get(`/labels/${createdlabelId}`)
      .expect(200)
      .expect((response) => {
        const label = response.body;
        expect(label.id).toBe(createdlabelId);
      });
  });

  it('/labels/:id (PATCH) - should update a specific label', () => {
    const updatedlabel = { la_libelle: 'Nouvelle label' }; // Provide the necessary data for updating the label

    return request(app.getHttpServer())
      .patch(`/labels/${createdlabelId}`)
      .send(updatedlabel)
      .expect(200)
      .expect((response) => {
        const retrievedlabel = response.body;
        expect(retrievedlabel.id).toBe(createdlabelId);
        expect(retrievedlabel.la_libelle).toBe(updatedlabel.la_libelle);
      });
  });

  it('/labels/:id (DELETE) - should delete a specific label', () => {
    return request(app.getHttpServer())
      .delete(`/labels/${createdlabelId}`)
      .expect(200);
  });
});
