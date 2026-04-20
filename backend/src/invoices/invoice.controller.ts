import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { GenerateInvoiceDto } from './invoice.dto';
import { InvoiceService } from './invoice.service';

/**
 * Contrôleur pour les factures
 */
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const invoice = await this.invoiceService.findOne(id);

    if (!invoice) {
      throw new NotFoundException('Facture introuvable');
    }

    return invoice;
  }

  @Get(':id/document')
  async getDocument(@Param('id') id: string) {
    const document = await this.invoiceService.getDocument(id);

    if (!document) {
      throw new NotFoundException('Facture introuvable');
    }

    return document;
  }

  @Post('generate-monthly')
  async generateMonthlyInvoice(@Body() dto: GenerateInvoiceDto) {
    return this.invoiceService.generateMonthlyInvoice(dto);
  }
}