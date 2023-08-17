import { CreateRepertoireDto } from "src/modules/repertoires/commun/dto/repertoires-create.dto";
import { EditRepertoireDto } from "src/modules/repertoires/commun/dto/repertoires-edit.dto";
import { Repertoire } from "src/modules/repertoires/commun/entity/repertoires";
import { IRepertoireCreator } from "src/modules/repertoires/commun/entity/repertoires.interface";
import { User } from "src/modules/users/entity/users";
import { v4 as uuidv4 } from 'uuid';

export default class RepertoiresServiceMock {
  private repertoires: Repertoire[] = [];

  async findAll(): Promise<Repertoire[]> {
    return this.repertoires;
  }

  async create(data: any): Promise<Repertoire> {
    const newRepertoire = { ...data, id: uuidv4() };
    this.repertoires.push(newRepertoire);
    return newRepertoire;
  }

  async findById(id: string): Promise<Repertoire> {
    return this.repertoires.find(repertoire => repertoire.id === id);
  }

  async delete(id: string) {
    const index = this.repertoires.findIndex(repertoire => repertoire.id === id);
    if (index !== -1) {
      this.repertoires.splice(index, 1);
    }
  }

  async update(editRepertoireDto: EditRepertoireDto, id: string) {
    const repertoire = this.repertoires.find(repertoire => repertoire.id === id);
    if (repertoire) {
      repertoire.libelle = editRepertoireDto.libelle;
    }
    return repertoire;
  }
}
