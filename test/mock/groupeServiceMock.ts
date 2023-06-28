
import { EditGroupeDto } from "src/modules/groupes/dto/groupes-edit.dto";
import { Groupe } from "src/modules/groupes/entity/groupes";
import { v4 as uuidv4 } from 'uuid';

export default class GroupesServiceMock {
  private groupes: Groupe[] = [];

  async findAll(): Promise<Groupe[]> {
    return this.groupes;
  }

  async findAllById_repertoire(id_repertoire: string): Promise<Groupe[]> {
    return this.groupes.filter(groupe => groupe.id_repertoire === id_repertoire);
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
      groupe.gr_libelle = editgroupeDto.gr_libelle;
      groupe.gr_couleur = editgroupeDto.gr_couleur;
      groupe.id_repertoire = editgroupeDto.id_repertoire;
    }
    return groupe;
  }
}
