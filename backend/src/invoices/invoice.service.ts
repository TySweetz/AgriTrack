import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { InvoiceEntity } from './invoice.entity';
import { DeliveryEntity } from '../deliveries/delivery.entity';
import { GenerateInvoiceDto } from './invoice.dto';

/**
 * Service pour la gestion des factures
 */
@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
  ) {}

  async findAll() {
    return this.invoiceRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.invoiceRepository.findOne({
      where: { id },
    });
  }

  async generateInvoiceNumber(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `FAC-${year}${month}`;

    const count = await this.invoiceRepository.count({
      where: { numero_facture: Like(`${prefix}-%`) },
    });

    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async generateMonthlyInvoice(dto: GenerateInvoiceDto) {
    const periodStart = new Date(dto.period_start);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(dto.period_end);
    periodEnd.setHours(23, 59, 59, 999);

    const deliveries = await this.deliveryRepository.find({
      where: {
        client_id: dto.client_id,
        date: Between(periodStart, periodEnd),
      },
      order: { date: 'ASC' },
    });

    const totalKg = deliveries.reduce((sum, delivery) => sum + Number(delivery.quantite_kg || 0), 0);
    const montantHt = totalKg * Number(dto.prix_unitaire_kg || 0);
    const montantTva = (montantHt * Number(dto.taux_tva || 0)) / 100;
    const montantTtc = montantHt + montantTva;

    const invoice = this.invoiceRepository.create({
      numero_facture: await this.generateInvoiceNumber(periodEnd),
      status: 'DRAFT',
      client_id: dto.client_id,
      period_start: periodStart,
      period_end: periodEnd,
      total_kg: totalKg,
      prix_unitaire_kg: dto.prix_unitaire_kg,
      montant_ht: montantHt,
      taux_tva: dto.taux_tva,
      montant_tva: montantTva,
      montant_ttc: montantTtc,
    });

    return this.invoiceRepository.save(invoice);
  }

  async getDocument(id: string) {
    const invoice = await this.findOne(id);

    if (!invoice) {
      return null;
    }

    return {
      invoice,
      documentTitle: 'Facture',
      printableReference: invoice.numero_facture,
      printablePeriod: `${new Date(invoice.period_start).toLocaleDateString('fr-FR')} - ${new Date(invoice.period_end).toLocaleDateString('fr-FR')}`,
    };
  }
}