import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repo: Repository<ProductEntity>,
  ) {}

  findAll() {
    return this.repo.find({ where: { actif: true }, order: { createdAt: 'DESC' } });
  }

  findByVendeur(vendeurId: string) {
    return this.repo.find({ where: { vendeurId }, order: { createdAt: 'DESC' } });
  }

<<<<<<< Updated upstream
=======
  findByVendeurPublic(vendeurId: string) {
    return this.repo.find({ where: { vendeurId, actif: true }, order: { createdAt: 'DESC' } });
  }

>>>>>>> Stashed changes
  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id } });
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
