import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité Client
 * Représente un client (acheteur d'asperges)
 */
@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255, nullable: false })
  nom!: string;

  @Column('varchar', { length: 20, nullable: true })
  telephone?: string;

  @Column('text', { nullable: true })
  adresse?: string;
}
