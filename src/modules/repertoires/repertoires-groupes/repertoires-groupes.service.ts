import { Injectable } from "@nestjs/common";
import { EditRepertoireDto } from "../commun/dto/repertoires-edit.dto";
import { IRepertoire } from "../commun/entity/repertoires.interface";
import { RepertoireGroupe } from "./entity/repertoires-groupes";
import { RepertoiresGroupesRepository } from "./repertoires-groupes.repository";
import { UserActions } from "src/modules/users/users.actions";
import { CreateRepertoireDto } from "../commun/dto/repertoires-create.dto";

@Injectable()
export class RepertoiresGroupesService {

  constructor(readonly repertoiresRepository: RepertoiresGroupesRepository, readonly userAction: UserActions,) { }

  async findAll(): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.getAll();
  }

  async findAllByUserId(userId: string) {
    return await this.repertoiresRepository.findByUserId(userId);
  }

  async create(data: CreateRepertoireDto) {
    const user = await this.userAction.getUserById(data.userId);
    const repertoireGroupe = RepertoireGroupe.factory({ ...data, user });
    return await this.repertoiresRepository.save(repertoireGroupe);
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
