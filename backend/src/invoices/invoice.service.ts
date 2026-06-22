import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { InvoiceEntity, InvoiceLine } from './invoice.entity';
import { OrderEntity } from '../orders/order.entity';
import { UserEntity } from '../users/user.entity';
import { CompanySettingsService } from '../company-settings/company-settings.service';

/**
 * Service pour la gestion des factures, generees a partir des commandes
 */
@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  findMine(vendeurId: string) {
    return this.invoiceRepository.find({
      where: { vendeurId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, vendeurId: string) {
    const invoice = await this.invoiceRepository.findOne({ where: { id, vendeurId } });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return invoice;
  }

  private async generateInvoiceNumber(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `FAC-${year}${month}`;

    const count = await this.invoiceRepository.count({
      where: { numero_facture: Like(`${prefix}-%`) },
    });

    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  /**
   * Genere la facture d'une commande (idempotent : renvoie la facture existante si deja generee)
   */
  async generateForOrder(orderId: string, vendeurId: string) {
    const existing = await this.invoiceRepository.findOne({ where: { orderId } });
    if (existing) return existing;

    // Note: select sur une relation `eager` n'est pas applique par TypeORM, donc on ne
    // touche pas a order.acheteur ici — seuls des champs precis en sont extraits plus bas,
    // jamais l'objet complet (qui contiendrait le mot de passe).
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.vendeurId !== vendeurId) throw new ForbiddenException();

    const vendeur = await this.userRepository.findOne({ where: { id: vendeurId } });
    const settings = await this.companySettingsService.getOrCreate(vendeurId);

    const montantTtc = Number(order.total);
    const tauxTva = settings.assujetti_tva ? Number(settings.taux_tva) : 0;
    const montantHt = settings.assujetti_tva ? montantTtc / (1 + tauxTva / 100) : montantTtc;
    const montantTva = montantTtc - montantHt;

    const items: InvoiceLine[] = order.items.map((item) => ({
      nomProduit: item.nomProduit,
      prixUnitaire: Number(item.prixUnitaire),
      unite: item.unite,
      quantite: Number(item.quantite),
      sousTotal: Number(item.sousTotal),
    }));

    const invoice = this.invoiceRepository.create({
      numero_facture: await this.generateInvoiceNumber(new Date()),
      orderId: order.id,
      vendeurId,
      vendeurNom: vendeur?.entreprise || vendeur?.nom || 'Vendeur',
      vendeurSiret: settings.siret || undefined,
      acheteurNom: order.acheteur?.pseudo || order.acheteur?.nom || 'Acheteur',
      acheteurAdresse: order.adresseLivraison || order.acheteur?.adresse,
      items,
      assujetti_tva: settings.assujetti_tva,
      taux_tva: tauxTva,
      montant_ht: Number(montantHt.toFixed(2)),
      montant_tva: Number(montantTva.toFixed(2)),
      montant_ttc: montantTtc,
    });

    return this.invoiceRepository.save(invoice);
  }

  async getDocument(id: string, vendeurId: string) {
    const invoice = await this.findOne(id, vendeurId);
    const settings = await this.companySettingsService.getSettings(vendeurId);

    return {
      invoice,
      printableReference: invoice.numero_facture,
      printableDate: new Date(invoice.created_at).toLocaleDateString('fr-FR'),
      signature: {
        enabled: settings.signature_enabled_invoice,
        url: settings.signature_url,
      },
    };
  }
}
