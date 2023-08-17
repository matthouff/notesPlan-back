
import { EditGroupeDto } from "src/modules/groupes/dto/groupes-edit.dto";
import { Groupe } from "src/modules/groupes/entity/groupes";
import { Repertoire } from "src/modules/repertoires/commun/entity/repertoires";
import { v4 as uuidv4 } from 'uuid';

export default class GroupesServiceMock {
  private groupes: Groupe[] = [];

  async findAll(): Promise<Groupe[]> {
    return this.groupes;
  }

  async findAllByrepertoireId(repertoire: Repertoire): Promise<Groupe[]> {
    return this.groupes.filter(groupe => groupe.repertoire === repertoire);
  }

  async create(data: any): Promise<Groupe> {
    const newgroupe = { ...data, id: uuidv4() };
    this.groupes.push(newgroupe);
    return newgroupe;
  }

  async findById(id: string): Promise<Groupe> {
    return this.groupes.find(groupe => groupe.id === id);
  }

  async delete(id: string) {
    const index = this.groupes.findIndex(groupe => groupe.id === id);
    if (index !== -1) {
      this.groupes.splice(index, 1);
    }
  }

  async update(editgroupeDto: EditGroupeDto, id: string) {
    const groupe = this.groupes.find(groupe => groupe.id === id);
    if (groupe) {
      groupe.libelle = editgroupeDto.libelle;
      groupe.couleur = editgroupeDto.couleur;
    }
    return groupe;
  }
}
