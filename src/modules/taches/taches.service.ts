import { Injectable } from "@nestjs/common";
import { EditTacheDto } from "./dto/taches-edit.dto";
import { Tache } from "./entity/taches";
import { ITache } from "./entity/taches.interface";
import { TacheRepository } from "./taches.repository";

@Injectable()
export class tacheService {

  constructor(readonly tachesRepository: TacheRepository) { }

  async findAll(): Promise<ITache[]> {
    return await this.tachesRepository.getAll();
  }

  async create(data: Tache): Promise<Tache> {
    return await this.tachesRepository.save(data);
  }

  async findById(id: string): Promise<Tache> {
    return await this.tachesRepository.findByID(id);
  }

  async delete(id: string) {
    return await this.tachesRepository.deleteByID(id);
  }

  async update(edittachesDto: EditTacheDto, id: string) {
    let taches = await this.tachesRepository.findByID(id);

    taches.edit(edittachesDto);

    return await this.tachesRepository.save(taches);
  }
}
