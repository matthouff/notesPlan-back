import { Injectable } from '@nestjs/common';
import { RepertoireGroupe } from '../repertoires/repertoires-groupes/entity/repertoires-groupes';
import { Groupe } from './entity/groupes';
import { IGroupe } from './entity/groupes.interface';
import { GroupesRepository } from './groupes.repository';
import { RepertoiresGroupeActions } from '../repertoires/repertoires-groupes/repertoires-groupes.actions';
import { TacheRepository } from '../taches/taches.repository';
import { CreateGroupeDto } from './dto/groupes-create.dto';
import { LabelRepository } from '../labels/labels.repository';

@Injectable()
export class GroupeService {
  constructor(
    readonly groupesRepository: GroupesRepository,
    readonly repertoiresActions: RepertoiresGroupeActions,
    readonly tacheRepository: TacheRepository,
    readonly labelRepository: LabelRepository,
  ) { }

  // Récupère tous les groupes
  async findAll(): Promise<IGroupe[]> {
    return await this.groupesRepository.getAll();
  }

  // Récupère tous les groupes d'un répertoire par son ID
  async findAllByRepertoireGroupeId(repertoireId: string) {
    repertoireId;

    const groupes = await this.groupesRepository.findByRepertoireId(
      repertoireId,
    );

    // On attribut aux groupes les tâches associés à ce dernier en tableau d'objet tâche
    const groupesWithTaches = await Promise.all(
      groupes.map(async (groupe) => {
        const taches = await this.tacheRepository.findByGroupeId(groupe.id);

        return {
          id: groupe.id,
          createdat: groupe.createdat,
          libelle: groupe.libelle,
          couleur: groupe.couleur,
          taches: await Promise.all(
            taches.map(async (tache) => {
              const labels = await this.labelRepository.findLabelByTacheId(
                tache.id,
              );

              return {
                id: tache.id,
                libelle: tache.libelle,
                labels: labels,
                detail: tache.detail,
                date: tache.date,
                createdat: tache.createdat,
              };
            }),
          ),
        };
      }),
    );

    return groupesWithTaches;
  }

  // Crée un nouveau groupe
  async create(data: CreateGroupeDto) {
    const repertoire = await this.repertoiresActions.getrepertoiresById(
      data.repertoireId,
    );
    const repertoireGroupe = Groupe.factory({ ...data, repertoire });
    return await this.groupesRepository.save(repertoireGroupe);
  }

  // Récupère un groupe par son ID
  async findById(id: string): Promise<Groupe> {
    return await this.groupesRepository.findByID(id);
  }

  // Supprime un groupe par son ID
  async delete(id: string) {
    return await this.groupesRepository.deleteByID(id);
  }

  // Met à jour un groupe par son ID
  async update(editgroupesDto: RepertoireGroupe, id: string) {
    let groupes = await this.groupesRepository.findByID(id);

    groupes.edit(editgroupesDto);

    return await this.groupesRepository.save(groupes);
  }
}
