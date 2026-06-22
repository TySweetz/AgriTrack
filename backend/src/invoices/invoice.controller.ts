import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Contrôleur pour les factures (scope: vendeur connecte)
 */
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findMine(@Request() req: any) {
    return this.invoiceService.findMine(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.invoiceService.findOne(id, req.user.id);
  }

  @Get(':id/document')
  getDocument(@Param('id') id: string, @Request() req: any) {
    return this.invoiceService.getDocument(id, req.user.id);
  }

  @Post('generate/:orderId')
  generate(@Param('orderId') orderId: string, @Request() req: any) {
    return this.invoiceService.generateForOrder(orderId, req.user.id);
  }
}
