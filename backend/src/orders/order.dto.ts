import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from './order.entity';

export class OrderItemDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(0.1)
  quantite!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString()
  @IsOptional()
  adresseLivraison?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  statut!: OrderStatus;
}
