import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';

const PUBLIC_VENDEUR_SELECT = {
  id: true,
  nom: true,
  entreprise: true,
  telephone: true,
} as const;

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repo: Repository<ProductEntity>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { actif: true },
      order: { createdAt: 'DESC' },
      select: { vendeur: PUBLIC_VENDEUR_SELECT },
    });
  }

  findByVendeur(vendeurId: string) {
    return this.repo.find({
      where: { vendeurId },
      order: { createdAt: 'DESC' },
      select: { vendeur: PUBLIC_VENDEUR_SELECT },
    });
  }

  findByVendeurPublic(vendeurId: string) {
    return this.repo.find({
      where: { vendeurId, actif: true },
      order: { createdAt: 'DESC' },
      select: { vendeur: PUBLIC_VENDEUR_SELECT },
    });
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id }, select: { vendeur: PUBLIC_VENDEUR_SELECT } });
    if (!p) throw new NotFoundException('Produit introuvable');
    return p;
  }

  async create(dto: CreateProductDto, vendeurId: string) {
    const product = this.repo.create({ ...dto, vendeurId });
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto, vendeurId: string) {
    const product = await this.findOne(id);
    if (product.vendeurId !== vendeurId) throw new ForbiddenException();
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async remove(id: string, vendeurId: string) {
    const product = await this.findOne(id);
    if (product.vendeurId !== vendeurId) throw new ForbiddenException();
    await this.repo.remove(product);
    return { success: true };
  }
}
