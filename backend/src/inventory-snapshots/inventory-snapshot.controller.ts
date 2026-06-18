import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { CreateInventorySnapshotDto, UpdateInventorySnapshotDto } from './inventory-snapshot.dto';
import { InventorySnapshotService } from './inventory-snapshot.service';

/**
 * Contrôleur pour les snapshots de stock du soir
 */
@Controller('inventory-snapshots')
export class InventorySnapshotController {
  constructor(private readonly snapshotService: InventorySnapshotService) {}

  @Get()
  async findAll() {
    return this.snapshotService.findAll();
  }

  @Get('latest/:limit')
  async getLatest(@Param('limit') limit: string) {
    return this.snapshotService.getLatest(Number(limit) || 7);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const snapshot = await this.snapshotService.findOne(id);

    if (!snapshot) {
      throw new NotFoundException('Snapshot introuvable');
    }

    return snapshot;
  }

  @Post()
  async create(@Body() dto: CreateInventorySnapshotDto) {
    return this.snapshotService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInventorySnapshotDto) {
    return this.snapshotService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.snapshotService.remove(id);
  }
}