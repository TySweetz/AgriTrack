import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';

/**
 * TypeORM n'applique pas le filtrage `select` sur une relation chargee en `eager: true`
 * (verifie : la requete generee selectionne quand meme toutes les colonnes, y compris
 * le mot de passe). On assainit donc manuellement le vendeur avant de renvoyer le produit.
 */
function sanitizeProduct<T extends ProductEntity>(product: T) {
  if (!product.vendeur) return product;
  return {
    ...product,
    vendeur: {
      id: product.vendeur.id,
      nom: product.vendeur.nom,
      entreprise: product.vendeur.entreprise,
      telephone: product.vendeur.telephone,
    },
  };
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repo: Repository<ProductEntity>,
  ) {}

  /**
   * Marketplace generale : uniquement les produits publies ET disponibles.
   * Les ruptures de stock restent visibles sur la boutique du vendeur (findByVendeurPublic)
   * et dans "Mes produits", mais pas ici, pour ne pas polluer la liste generale.
   */
  async findAll() {
    const products = await this.repo.find({
      where: { actif: true, stock: MoreThan(0) },
      order: { createdAt: 'DESC' },
    });
    return products.map(sanitizeProduct);
  }

  async findByVendeur(vendeurId: string) {
    const products = await this.repo.find({ where: { vendeurId }, order: { createdAt: 'DESC' } });
    return products.map(sanitizeProduct);
  }

  /**
   * Boutique publique du vendeur : tous ses produits publies, y compris les ruptures
   * de stock (affichees comme indisponibles cote acheteur, pas masquees).
   */
  async findByVendeurPublic(vendeurId: string) {
    const products = await this.repo.find({ where: { vendeurId, actif: true }, order: { createdAt: 'DESC' } });
    return products.map(sanitizeProduct);
  }

  private async loadOne(id: string) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async findOne(id: string) {
    return sanitizeProduct(await this.loadOne(id));
  }

  async create(dto: CreateProductDto, vendeurId: string) {
    const product = this.repo.create({ ...dto, vendeurId });
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto, vendeurId: string) {
    const product = await this.loadOne(id);
    if (product.vendeurId !== vendeurId) throw new ForbiddenException();
    Object.assign(product, dto);
    return sanitizeProduct(await this.repo.save(product));
  }

  async remove(id: string, vendeurId: string) {
    const product = await this.loadOne(id);
    if (product.vendeurId !== vendeurId) throw new ForbiddenException();
    await this.repo.remove(product);
    return { success: true };
  }
}
