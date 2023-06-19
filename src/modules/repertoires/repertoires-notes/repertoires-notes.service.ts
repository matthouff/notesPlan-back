import { Injectable } from "@nestjs/common";
import { EditRepertoireDto } from "../commun/dto/repertoires-edit.dto";
import { Repertoire } from "../commun/entity/repertoires";
import { IRepertoire } from "../commun/entity/repertoires.interface";
import { RepertoiresNotesRepository } from "./repertoires-notes.repository";

@Injectable()
export class RepertoiresNotesService {

  constructor(readonly repertoiresRepository: RepertoiresNotesRepository) { }

  async findAll(): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.getAll();
  }

  async findAllByUserId(id_user: string): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.findAllByUserId(id_user);
  }

  async create(data: Repertoire): Promise<Repertoire> {
    return await this.repertoiresRepository.save(data);
  }

  async findById(id: string): Promise<Repertoire> {
    return await this.repertoiresRepository.findByID(id);
  }

  async delete(id: string) {
    return await this.repertoiresRepository.deleteByID(id);
  }

  async update(editrepertoiresDto: EditRepertoireDto, id: string) {
    let repertoires = await this.repertoiresRepository.findByID(id);

    repertoires.edit(editrepertoiresDto);

    return await this.repertoiresRepository.save(repertoires);
  }
}
