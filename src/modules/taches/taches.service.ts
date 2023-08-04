import { Injectable } from "@nestjs/common";
import { EditTacheDto } from "./dto/taches-edit.dto";
import { Tache } from "./entity/taches";
import { ITache } from "./entity/taches.interface";
import { TacheRepository } from "./taches.repository";
import { TacheActions } from "./taches.actions";
import { GroupeActions } from "../groupes/groupes.actions";
import { CreateTacheDto } from "./dto/taches-create.dto";

@Injectable()
export class TacheService {

  constructor(readonly tachesRepository: TacheRepository, readonly groupeActions: GroupeActions) { }

  async findAll(): Promise<ITache[]> {
    return await this.tachesRepository.getAll();
  }

  async findAllByGroupeId(id_groupe: string): Promise<ITache[]> {
    return await this.tachesRepository.findByGroupeId(id_groupe);
  }

  async create(data: CreateTacheDto) {
    const groupe = await this.groupeActions.getGroupeById(data.groupeId);
    const groupeElement = Tache.factory({ ...data, groupe });
    return await this.tachesRepository.save(groupeElement);
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
