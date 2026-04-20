import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

/**
 * Contrôleur pour la gestion de l'inventaire
 */
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * GET /inventory - Récupère tous les stocks
   */
  @Get()
  async findAll() {
    return this.inventoryService.findAll();
  }

  /**
   * GET /inventory/:id - Récupère un stock
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  /**
   * POST /inventory - Crée un nouveau stock
   */
  @Post()
  async create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  /**
   * PATCH /inventory/:id - Met à jour un stock
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  /**
   * DELETE /inventory/:id - Supprime un stock
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
