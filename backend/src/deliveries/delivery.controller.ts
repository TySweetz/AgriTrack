import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto, UpdateDeliveryDto } from './delivery.dto';

/**
 * Contrôleur pour la gestion des livraisons
 */
@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  /**
   * GET /deliveries - Récupère toutes les livraisons
   */
  @Get()
  async findAll() {
    return this.deliveryService.findAll();
  }

  /**
   * GET /deliveries/:id - Récupère une livraison
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deliveryService.findOne(id);
  }

  /**
   * POST /deliveries - Crée une nouvelle livraison
   */
  @Post()
  async create(@Body() dto: CreateDeliveryDto) {
    return this.deliveryService.create(dto);
  }

  /**
   * PATCH /deliveries/:id - Met à jour une livraison
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryDto) {
    return this.deliveryService.update(id, dto);
  }

  /**
   * DELETE /deliveries/:id - Supprime une livraison
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deliveryService.remove(id);
  }
}
