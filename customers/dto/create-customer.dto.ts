import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva',
    maxLength: 255
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao.silva@exemplo.com'
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({ 
    required: false,
    description: 'País do cliente',
    example: 'Brasil',
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'O país deve ser uma string' })
  @MaxLength(100, { message: 'O país deve ter no máximo 100 caracteres' })
  pais?: string;
}
