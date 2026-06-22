import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private service: ReviewService) {}

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.service.findByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('product/:productId/mine')
  findMine(@Param('productId') productId: string, @Request() req: any) {
    return this.service.findMine(productId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  upsert(@Body() dto: CreateReviewDto, @Request() req: any) {
    return this.service.upsert(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.id);
  }
}
