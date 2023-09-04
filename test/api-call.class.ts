import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class ApiCall {
  constructor(readonly nestApp: INestApplication) {}

  /**
   * ### Méthode permettant d'exécuter une requête POST sur une route définie
   * @param {string} route La route sur laquelle faire la requête POST
   * @param {any} body Le corps de la requête POST
   * @returns
   */
  async post<T extends Object>(route: string, body?: T, token?: string) {
    let req = request(this.nestApp.getHttpServer()).post(route);

    if (body) {
      req.send(body);
    }
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }

    return await req;
  }

  /**
   * ### Méthode permettant d'exécuter une requête PUT sur une route définie
   * @param {string} route La route sur laquelle faire la requête PUT
   * @param {string} query La requête pour filtrer les données
   * @param {any} body Le corps de la requête PUT
   * @returns
   */
  async patch<T extends Object>(
    route: string,
    query: string | number,
    body: T,
  ) {
    const uri = `${route}/${query}`;
    return await request(this.nestApp.getHttpServer()).patch(uri).send(body);
  }

  /**
   * ### Méthode permettant d'exécuter une requête GET sur une route définie
   * @param {string} route La route sur laquelle faire la requête GET
   * @param {string} query La requête pour filtrer les données
   * @returns
   */
  async get(route: string, query?: string | number, token?: string) {
    const uri = query ? `${route}/${query}` : route;

    const req = request(this.nestApp.getHttpServer()).get(uri);

    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }

    return await req;
  }

  /**
   * ### Méthode permettant d'exécuter une requête DELETE sur une route définie
   * @param {string} route La route sur laquelle faire la requête DELETE
   * @param {string} query La requête pour filtrer les données
   * @returns
   */
  async delete<T>(route: string, query: T) {
    const uri = `${route}/${query}`;
    return await request(this.nestApp.getHttpServer()).delete(uri);
  }
}
