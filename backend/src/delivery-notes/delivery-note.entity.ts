import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface DeliveryNoteLine {
  nomProduit: string;
  unite: string;
  quantite: number;
}

/**
 * Bon de livraison genere automatiquement quand une commande est marquee "livree".
 * Snapshot figé au moment de la generation (cf. InvoiceEntity pour la meme logique).
 */
@Entity('delivery_notes')
export class DeliveryNoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50, nullable: false, unique: true })
  numero_bon!: string;

  @Column('uuid', { unique: true })
  orderId!: string;

  @Column('uuid')
  vendeurId!: string;

  @Column('varchar', { length: 255 })
  vendeurNom!: string;

  @Column('varchar', { length: 255 })
  acheteurNom!: string;

  @Column('text', { nullable: true })
  adresseLivraison?: string;

  @Column('jsonb')
  items!: DeliveryNoteLine[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
