import { User } from 'src/modules/users/entity/users';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('groupes')
export class Groupe extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  gr_libelle: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gr_couleur: string | null;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn({ type: 'date', default: () => 'CURRENT_DATE' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date', default: () => 'CURRENT_DATE' })
  updated_at: Date;
}