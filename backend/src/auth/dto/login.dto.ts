import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @ApiProperty({ example: 'auth_data_123' })
  @IsString()
  @IsNotEmpty()
  authData: string;

  @ApiPropertyOptional({ example: 'DRIVER', description: 'User role (DRIVER for driver app)' })
  @IsString()
  @IsOptional()
  role?: string;
}
