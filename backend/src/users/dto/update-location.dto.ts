import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Foydalanuvchi GPS joylashuvini yangilash DTO
 * Driver va Dispetcher (va boshqa autentifikatsiya qilingan rollar) tomonidan ishlatiladi
 */
export class UpdateLocationDto {
  @ApiProperty({ example: 41.3111, description: 'Kenglik (latitude)' })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 69.2797, description: 'Uzunlik (longitude)' })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @ApiPropertyOptional({ description: 'Aniqlik (metrlarda)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  accuracy?: number;
}
