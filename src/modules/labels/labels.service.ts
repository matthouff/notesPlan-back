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

  async findAll(): Promise<ILabel[]> {
    return await this.labelsRepository.getAll();
  }

  async findAllLabelByRepertoireId(repertoireId: string): Promise<ILabel[]> {
    return await this.labelsRepository.findAllLabelByRepertoireId(repertoireId);
  }

  async create(data: CreateLabelDto) {
    const repertoire = await this.repertoiresGroupeActions.getrepertoiresById(data.repertoireId);
    const repertoireElement = Label.factory({ ...data, repertoire });
    return await this.labelsRepository.save(repertoireElement);
  }

  async findById(id: string): Promise<Label> {
    return await this.labelsRepository.findByID(id);
  }

  async findAllByTacheId(tacheId: string): Promise<ILabel[]> {
    return await this.labelsRepository.findLabelByTacheId(tacheId);
  }

  async delete(id: string) {
    return await this.labelsRepository.deleteByID(id);
  }


  // Table de liaison Taches / Labels

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
