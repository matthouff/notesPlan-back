import { Injectable } from '@nestjs/common';
import { EditRepertoireDto } from '../commun/dto/repertoires-edit.dto';
import { Repertoire } from '../commun/entity/repertoires';
import { IRepertoire } from '../commun/entity/repertoires.interface';
import { RepertoireNote } from './entity/repertoires-notes';
import { RepertoiresNotesRepository } from './repertoires-notes.repository';
import { CreateRepertoireDto } from '../commun/dto/repertoires-create.dto';
import { UserActions } from 'src/modules/users/users.actions';

@Injectable()
export class RepertoiresNotesService {
  constructor(
    readonly repertoiresRepository: RepertoiresNotesRepository,
    readonly userAction: UserActions,
  ) {}

  async findAll(): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.getAll();
  }

  async findAllByUserId(userId: string) {
    return await this.repertoiresRepository.findByUserId(userId);
  }

  async create(data: CreateRepertoireDto) {
    const user = await this.userAction.getUserById(data.userId);

    const repertoireNote = RepertoireNote.factory({ ...data, user });

    console.log(user);
    return await this.repertoiresRepository.save(repertoireNote);
  }

  async findById(id: string): Promise<RepertoireNote> {
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
