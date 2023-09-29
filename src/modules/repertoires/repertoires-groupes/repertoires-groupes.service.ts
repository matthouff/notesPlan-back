import { Injectable } from '@nestjs/common';
import { EditRepertoireDto } from '../commun/dto/repertoires-edit.dto';
import { IRepertoire } from '../commun/entity/repertoires.interface';
import { RepertoireGroupe } from './entity/repertoires-groupes';
import { RepertoiresGroupesRepository } from './repertoires-groupes.repository';
import { UserActions } from 'src/modules/users/users.actions';
import { CreateRepertoireDto } from '../commun/dto/repertoires-create.dto';

@Injectable()
export class RepertoiresGroupesService {
  constructor(
    readonly repertoiresRepository: RepertoiresGroupesRepository,
    readonly userAction: UserActions,
  ) { }

  /**
   * Récupère tous les répertoires de groupes.
   * @returns Une liste de tous les répertoires de groupes.
   */
  async findAll(): Promise<IRepertoire[]> {
    return await this.repertoiresRepository.getAll();
  }

  /**
   * Récupère tous les répertoires de groupes associés à un utilisateur.
   * @param userId L'identifiant de l'utilisateur.
   * @returns Une liste de répertoires de groupes associés à l'utilisateur.
   */
  async findAllByUserId(userId: string) {
    const repertoire = await this.repertoiresRepository.findByUserId(userId);

    repertoire.sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())

    return repertoire
  }

  /**
   * Crée un nouveau répertoire de groupes.
   * @param data Les données du répertoire à créer.
   * @returns Le répertoire de groupes créé.
   */
  async create(data: CreateRepertoireDto) {
    const user = await this.userAction.getUserById(data.userId);
    const repertoireGroupe = RepertoireGroupe.factory({ ...data, user });
    return await this.repertoiresRepository.save(repertoireGroupe);
  }

  /**
   * Récupère un répertoire de groupes par son identifiant.
   * @param id L'identifiant du répertoire à récupérer.
   * @returns Le répertoire de groupes correspondant à l'identifiant.
   */
  async findById(id: string): Promise<RepertoireGroupe> {
    return await this.repertoiresRepository.findByID(id);
  }

  /**
   * Supprime un répertoire de groupes par son identifiant.
   * @param id L'identifiant du répertoire à supprimer.
   * @returns Une promesse résolue une fois que le répertoire est supprimé.
   */
  async delete(id: string) {
    return await this.repertoiresRepository.deleteByID(id);
  }

  /**
   * Met à jour un répertoire de groupes.
   * @param editrepertoiresDto Les données de mise à jour du répertoire.
   * @param id L'identifiant du répertoire à mettre à jour.
   * @returns Le répertoire de groupes mis à jour.
   */
  async update(editrepertoiresDto: EditRepertoireDto, id: string) {
    let repertoires = await this.repertoiresRepository.findByID(id);

    repertoires.edit(editrepertoiresDto);

    return await this.repertoiresRepository.save(repertoires);
  }
}
