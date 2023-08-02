import { Injectable } from "@nestjs/common";
import { RepertoireGroupe } from "../repertoires/repertoires-groupes/entity/repertoires-groupes";
import { EditGroupeDto } from "./dto/groupes-edit.dto";
import { Groupe } from "./entity/groupes";
import { IGroupe } from "./entity/groupes.interface";
import { GroupesRepository } from "./groupes.repository";
import { RepertoiresGroupeActions } from "../repertoires/repertoires-groupes/repertoires-groupes.actions";
import { TacheRepository } from "../taches/taches.repository";

@Injectable()
export class GroupeService {

  constructor(readonly groupesRepository: GroupesRepository, readonly repertoiresActions: RepertoiresGroupeActions, readonly tacheRepository: TacheRepository,) { }

  async findAll(): Promise<IGroupe[]> {
    return await this.groupesRepository.getAll();
  }

  async findAllByRepertoireGroupeId(repertoireId: string) {
    const groupes = await this.groupesRepository.findByRepertoireId(repertoireId);

    // Fetch tasks for each group using TacheRepository
    const groupesWithTaches = await Promise.all(
      groupes.map(async (groupe) => {
        const taches = await this.tacheRepository.findByGroupeId(groupe.id);
        return {
          libelle: groupe.libelle,
          couleur: groupe.couleur,
          taches: taches.map(tache => ({
            id: tache.id,
            libelle: tache.libelle,
            couleur: tache.couleur,
            detail: tache.detail,
            date: tache.date,
          })),
        };
      })
    );

    return groupesWithTaches;
  }

  async create(data: Groupe) {
    const repertoire = await this.repertoiresActions.getrepertoiresById(data.repertoire.id);
    const repertoireGroupe = Groupe.factory({ ...data, repertoire });
    return await this.groupesRepository.save(repertoireGroupe);
  }

  async findById(id: string): Promise<Groupe> {
    return await this.groupesRepository.findByID(id);
  }

  async delete(id: string) {
    return await this.groupesRepository.deleteByID(id);
  }

  async update(editgroupesDto: RepertoireGroupe, id: string) {
    let groupes = await this.groupesRepository.findByID(id);

    groupes.edit(editgroupesDto);

    return await this.groupesRepository.save(groupes);
  }
}
