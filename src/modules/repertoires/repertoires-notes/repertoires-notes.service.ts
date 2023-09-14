import { Injectable } from '@nestjs/common';
import { EditRepertoireDto } from '../commun/dto/repertoires-edit.dto';
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
  ) { }

  /**
   * Récupère tous les répertoires de notes de la base de données.
   * @returns Une liste de répertoires de notes.
   */
  async findAll(): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.getAll();
  }

  /**
   * Récupère tous les répertoires de notes associés à un utilisateur spécifique.
   * @param userId L'identifiant de l'utilisateur dont les répertoires de notes sont recherchés.
   * @returns Une liste de répertoires de notes associés à l'utilisateur.
   */
  async findAllByUserId(userId: string) {
    return await this.repertoiresRepository.findByUserId(userId);
  }

  /**
   * Crée un nouveau répertoire de notes.
   * @param data Les données du répertoire de notes à créer.
   * @returns Le répertoire de notes créé.
   */
  async create(data: CreateRepertoireDto) {
    const user = await this.userAction.getUserById(data.userId);
    const repertoireNote = RepertoireNote.factory({ ...data, user });
    return await this.repertoiresRepository.save(repertoireNote);
  }

  /**
   * Récupère un répertoire de notes par son identifiant.
   * @param id L'identifiant du répertoire de notes à rechercher.
   * @returns Le répertoire de notes correspondant à l'identifiant.
   */
  async findById(id: string): Promise<RepertoireNote> {
    return await this.repertoiresRepository.findByID(id);
  }

  /**
   * Supprime un répertoire de notes par son identifiant.
   * @param id L'identifiant du répertoire de notes à supprimer.
   */
  async delete(id: string) {
    return await this.repertoiresRepository.deleteByID(id);
  }

  /**
   * Met à jour un répertoire de notes par son identifiant.
   * @param editrepertoiresDto Les données de mise à jour du répertoire de notes.
   * @param id L'identifiant du répertoire de notes à mettre à jour.
   * @returns Le répertoire de notes mis à jour.
   */
  async update(editrepertoiresDto: EditRepertoireDto, id: string) {
    let repertoires = await this.repertoiresRepository.findByID(id);

    repertoires.edit(editrepertoiresDto);

    return await this.repertoiresRepository.save(repertoires);
  }
}
