import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventorySnapshotDto, UpdateInventorySnapshotDto } from './inventory-snapshot.dto';
import { InventorySnapshotEntity } from './inventory-snapshot.entity';

/**
 * Service pour les snapshots de stock du soir
 */
@Injectable()
export class InventorySnapshotService {
  constructor(
    @InjectRepository(InventorySnapshotEntity)
    private readonly snapshotRepository: Repository<InventorySnapshotEntity>,
  ) {}

  async findAll() {
    return this.snapshotRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.snapshotRepository.findOne({ where: { id } });
  }

  async create(dto: CreateInventorySnapshotDto) {
    const snapshot = this.snapshotRepository.create({
      date: new Date(dto.date),
      stock_restant_kg: dto.stock_restant_kg,
      notes: dto.notes,
    });

    return this.snapshotRepository.save(snapshot);
  }

  async update(id: string, dto: UpdateInventorySnapshotDto) {
    const payload: Partial<InventorySnapshotEntity> = {};

    if (dto.date !== undefined) {
      payload.date = new Date(dto.date);
    }

    if (dto.stock_restant_kg !== undefined) {
      payload.stock_restant_kg = dto.stock_restant_kg;
    }

    if (dto.notes !== undefined) {
      payload.notes = dto.notes;
    }

    await this.snapshotRepository.update(id, payload);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.snapshotRepository.delete(id);
    return { message: 'Snapshot supprimé avec succès' };
  }

  async getLatest(limit: number = 7) {
    return this.snapshotRepository.find({
      order: { date: 'DESC' },
      take: limit,
    });
  }
}