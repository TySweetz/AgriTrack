import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private service: OrderService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get('mes-commandes')
  findMine(@Request() req: any) {
    return this.service.findByAcheteur(req.user.id);
  }

  @Get('commandes-recues')
  findReceived(@Request() req: any) {
    return this.service.findByVendeur(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/statut')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Request() req: any) {
    return this.service.updateStatus(id, dto, req.user.id);
  }
}
