import { Injectable } from "@nestjs/common";
import { EditRepertoireDto } from "../commun/dto/repertoires-edit.dto";
import { Repertoire } from "../commun/entity/repertoires";
import { IRepertoire } from "../commun/entity/repertoires.interface";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";

@Injectable()
export class RepertoiresGroupesService {

  constructor(readonly repertoiresRepository: RepertoiresGroupesRepository) { }

  async findAll(): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.getAll();
  }

  async findAllByUserId(userId: string): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.findAllByUserId(userId);
  }

  async create(data: RepertoireGroupe): Promise<RepertoireGroupe> {
    return await this.repertoiresRepository.save(data);
  }

  async findById(id: string): Promise<RepertoireGroupe> {
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
