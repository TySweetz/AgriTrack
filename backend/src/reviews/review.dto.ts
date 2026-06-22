import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  productId!: string;

  @IsIn([1, 2, 3, 4, 5])
  note!: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  commentaire?: string;
}
