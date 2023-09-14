import { Injectable, NotFoundException } from "@nestjs/common";
import { EditLabelDto } from "./dto/labels-edit.dto";
import { Label } from "./entity/labels";
import { ILabel } from "./entity/labels.interface";
import { LabelRepository } from "./labels.repository";
import { TacheRepository } from "../taches/taches.repository";
import { CreateLabelDto } from "./dto/labels-create.dto";
import { LabelActions } from "./labels.actions";
import { RepertoiresGroupeActions } from "../repertoires/repertoires-groupes/repertoires-groupes.actions";

@Injectable()
export class LabelService {

  constructor(
    readonly labelsRepository: LabelRepository,
    readonly tachesRepository: TacheRepository,
    readonly repertoiresGroupeActions: RepertoiresGroupeActions
  ) { }

  /**
   * Récupère tous les labels.
   * @returns Une liste de labels.
   */
  async findAll(): Promise<ILabel[]> {
    return await this.labelsRepository.getAll();
  }

  /**
   * Récupère tous les labels liés à un répertoire spécifique par son ID.
   * @param repertoireId L'ID du répertoire pour lequel récupérer les labels.
   * @returns Une liste de labels liés au répertoire.
   */
  async findAllLabelByRepertoireId(repertoireId: string): Promise<ILabel[]> {
    return await this.labelsRepository.findAllLabelByRepertoireId(repertoireId);
  }

  /**
   * Crée un nouveau label.
   * @param data Les données pour créer le label.
   * @returns Le label créé.
   */
  async create(data: CreateLabelDto) {
    const repertoire = await this.repertoiresGroupeActions.getrepertoiresById(data.repertoireId);
    const repertoireElement = Label.factory({ ...data, repertoire });
    return await this.labelsRepository.save(repertoireElement);
  }

  /**
   * Récupère un label par son ID.
   * @param id L'ID du label à récupérer.
   * @returns Le label trouvé.
   */
  async findById(id: string): Promise<Label> {
    return await this.labelsRepository.findByID(id);
  }

  /**
   * Récupère tous les labels liés à une tâche spécifique par son ID.
   * @param tacheId L'ID de la tâche pour laquelle récupérer les labels.
   * @returns Une liste de labels liés à la tâche.
   */
  async findAllByTacheId(tacheId: string): Promise<ILabel[]> {
    return await this.labelsRepository.findLabelByTacheId(tacheId);
  }

  /**
   * Supprime un label par son ID.
   * @param id L'ID du label à supprimer.
   */
  async delete(id: string) {
    return await this.labelsRepository.deleteByID(id);
  }


  // Table de liaison Taches / Labels
  /**
     * Ajoute un label à une tâche spécifique.
     * @param tacheId L'ID de la tâche à laquelle ajouter le label.
     * @param label L'ID du label à ajouter.
     */
  async AddLabelToTache(tacheId: string, label: string): Promise<void> {
    const labelAdded = await this.labelsRepository.findByID(label);
    const tache = await this.tachesRepository.findByID(tacheId);

    if (!tache) {
      throw new NotFoundException('Tache introuvable');
    }

    const labelTache = await this.labelsRepository.findLabelByTacheId(tache.id);

    tache.label = [...labelTache, labelAdded]

    await this.tachesRepository.save(tache);
  }

  /**
   * Supprime un label d'une tâche spécifique.
   * @param labelId L'ID du label à supprimer.
   * @param tacheId L'ID de la tâche de laquelle supprimer le label.
   */
  async removeLabelFromTache(labelId: string, tacheId: string): Promise<void> {
    const tache = await this.tachesRepository.findByID(tacheId);
    if (!tache) {
      throw new NotFoundException('Tache introuvable');
    }

    const label = await this.labelsRepository.findLabelByTacheId(tache.id);
    tache.label = label.filter(label => label.id !== labelId);

    await this.tachesRepository.save(tache); // Sauvegardez les modifications
  }
}
