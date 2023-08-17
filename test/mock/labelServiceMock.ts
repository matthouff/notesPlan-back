
import { EditLabelDto } from 'src/modules/labels/dto/labels-edit.dto';
import { Label } from 'src/modules/labels/entity/labels';
import { Tache } from 'src/modules/taches/entity/taches';
import { v4 as uuidv4 } from 'uuid';

export default class LabelsServiceMock {
  private labels: Label[] = [];

  async findAll(): Promise<Label[]> {
    return this.labels;
  }

  async findAllById_tache(tache: Tache[]): Promise<Label[]> {
    return this.labels.filter(label => label.tache === tache);
  }

  async create(data: any): Promise<Label> {
    const newlabel = { ...data, id: uuidv4() };
    this.labels.push(newlabel);
    return newlabel;
  }

  async findById(id: string): Promise<Label> {
    return this.labels.find(label => label.id === id);
  }

  async delete(id: string) {
    const index = this.labels.findIndex(label => label.id === id);
    if (index !== -1) {
      this.labels.splice(index, 1);
    }
  }

  async update(editlabelDto: EditLabelDto, id: string) {
    const label = this.labels.find(label => label.id === id);
    if (label) {
      label.libelle = editlabelDto.libelle;
      label.couleur = editlabelDto.couleur;
    }
    return label;
  }
}
