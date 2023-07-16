import { Injectable } from "@nestjs/common";
import { RepertoireGroupe } from "../repertoires/repertoires-groupes/entity/repertoires-groupes";
import { EditGroupeDto } from "./dto/groupes-edit.dto";
import { Groupe } from "./entity/groupes";
import { IGroupe } from "./entity/groupes.interface";
import { GroupesRepository } from "./groupes.repository";

@Injectable()
export class GroupeService {

  constructor(readonly groupesRepository: GroupesRepository) { }

  async findAll(): Promise<IGroupe[]> {
    return await this.groupesRepository.getAll();
  }

  async create(data: Groupe): Promise<Groupe> {
    return await this.groupesRepository.save(data);
  }

  async findById(id: string): Promise<Groupe> {
    return await this.groupesRepository.findByID(id);
  }

  async delete(id: string) {
    return await this.groupesRepository.deleteByID(id);
  }

  async update(editgroupesDto: RepertoireGroupe, id: string) {
    let groupes = await this.groupesRepository.findByID(id);

    groupes.edit(editgroupesDto);

    return await this.groupesRepository.save(groupes);
  }
}
