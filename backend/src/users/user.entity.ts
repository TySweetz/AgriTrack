import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  AGRICULTEUR = 'agriculteur',
  ACHETEUR = 'acheteur',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ACHETEUR })
  role!: UserRole;

  @Column()
  nom!: string;

  @Column({ nullable: true, type: 'varchar' })
  entreprise?: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  adresse?: string;

  @Column({ nullable: true, type: 'varchar' })
  pseudo?: string;

  @Column({ nullable: true, type: 'varchar' })
  resetToken?: string;

  @Column({ nullable: true, type: 'timestamptz' })
  resetTokenExpires?: Date;
}
