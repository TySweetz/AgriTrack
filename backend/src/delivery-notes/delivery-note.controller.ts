import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { DeliveryNoteService } from './delivery-note.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Contrôleur pour les bons de livraison (scope: vendeur connecte)
 */
@Controller('delivery-notes')
@UseGuards(JwtAuthGuard)
export class DeliveryNoteController {
  constructor(private readonly deliveryNoteService: DeliveryNoteService) {}

  @Get()
  findMine(@Request() req: any) {
    return this.deliveryNoteService.findMine(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.deliveryNoteService.findOne(id, req.user.id);
  }

  @Get(':id/document')
  getDocument(@Param('id') id: string, @Request() req: any) {
    return this.deliveryNoteService.getDocument(id, req.user.id);
  }

  @Post('generate/:orderId')
  generate(@Param('orderId') orderId: string, @Request() req: any) {
    return this.deliveryNoteService.generateForOrder(orderId, req.user.id);
  }
}
