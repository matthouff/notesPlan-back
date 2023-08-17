
import { Groupe } from 'src/modules/groupes/entity/groupes';
import { EditTacheDto } from 'src/modules/taches/dto/taches-edit.dto';
import { Tache } from 'src/modules/taches/entity/taches';
import { v4 as uuidv4 } from 'uuid';

export default class TachesServiceMock {
  private taches: Tache[] = [];

  async findAll(): Promise<Tache[]> {
    return this.taches;
  }

  async findAllById_groupe(groupe: Groupe): Promise<Tache[]> {
    return this.taches.filter(tache => tache.groupe === groupe);
  }

  async create(data: any): Promise<Tache> {
    const newtache = { ...data, id: uuidv4() };
    this.taches.push(newtache);
    return newtache;
  }

  async findById(id: string): Promise<Tache> {
    return this.taches.find(tache => tache.id === id);
  }

  async delete(id: string) {
    const index = this.taches.findIndex(tache => tache.id === id);
    if (index !== -1) {
      this.taches.splice(index, 1);
    }
  }

  async update(edittacheDto: EditTacheDto, id: string) {
    const tache = this.taches.find(tache => tache.id === id);
    if (tache) {
      tache.libelle = edittacheDto.libelle;
      tache.detail = edittacheDto.detail;
    }
    return tache;
  }
}
