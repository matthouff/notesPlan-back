import { Injectable, NotFoundException } from '@nestjs/common';
import { EditTacheDto } from './dto/taches-edit.dto';
import { Tache } from './entity/taches';
import { ITache } from './entity/taches.interface';
import { TacheRepository } from './taches.repository';
import { GroupeActions } from '../groupes/groupes.actions';
import { CreateTacheDto } from './dto/taches-create.dto';
import { LabelRepository } from '../labels/labels.repository';

@Injectable()
export class TacheService {
  constructor(
    readonly tachesRepository: TacheRepository,
    readonly groupeActions: GroupeActions,
    readonly labelRepository: LabelRepository,
  ) { }

  /**
   * Récupère toutes les tâches existantes.
   * @returns Une liste de toutes les tâches.
   */
  async findAll(): Promise<ITache[]> {
    return await this.tachesRepository.getAll();
  }

  /**
   * Récupère toutes les tâches associées à un groupe spécifique.
   * @param id_groupe L'identifiant du groupe pour lequel rechercher les tâches.
   * @returns Une liste des tâches associées au groupe.
   */
  async findAllByGroupeId(id_groupe: string): Promise<ITache[]> {
    return await this.tachesRepository.findByGroupeId(id_groupe);
  }

  /**
   * Crée une nouvelle tâche avec les données fournies.
   * @param data Les données de la tâche à créer.
   * @returns La tâche créée.
   */
  async create(data: CreateTacheDto) {
    const groupe = await this.groupeActions.getGroupeById(data.groupeId);
    const groupeElement = Tache.factory({ ...data, groupe });
    return await this.tachesRepository.save(groupeElement);
  }

  /**
   * Récupère une tâche par son identifiant.
   * @param id L'identifiant de la tâche à récupérer.
   * @returns La tâche récupérée.
   */
  async findById(id: string): Promise<Tache> {
    return await this.tachesRepository.findByID(id);
  }

  /**
   * Supprime une tâche par son identifiant.
   * @param id L'identifiant de la tâche à supprimer.
   * @returns Une confirmation de la suppression.
   */
  async delete(id: string) {
    return await this.tachesRepository.deleteByID(id);
  }

  /**
   * Met à jour une tâche avec les données fournies.
   * @param edittachesDto Les données mises à jour de la tâche.
   * @param id L'identifiant de la tâche à mettre à jour.
   * @returns La tâche mise à jour.
   */
  async update(edittachesDto: EditTacheDto, id: string) {
    let taches = await this.tachesRepository.findByID(id);
    await taches.edit(edittachesDto);

    const groupe = await this.groupeActions.getGroupeById(
      edittachesDto.groupeId,
    );
    const groupeElement = Tache.factory({ ...edittachesDto, groupe });
    await this.tachesRepository.save(groupeElement);

    return await this.tachesRepository.save(taches);
  }
}
