import { 
  IsArray, 
  IsDateString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  ValidateNested, 
  ArrayMinSize,
  MaxLength,
  IsPositive,
  IsInt,
  IsMongoId,
  IsUrl
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ItemDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Notebook Dell'
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  @MaxLength(255, { message: 'O nome do produto deve ter no máximo 255 caracteres' })
  produto: string;

  @ApiProperty({
    description: 'Quantidade do item',
    example: 2,
    minimum: 1
  })
  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @IsPositive({ message: 'A quantidade deve ser maior que zero' })
  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário em USD',
    example: 999.99,
    minimum: 0.01
  })
  @IsNumber({}, { message: 'O preço unitário deve ser um número' })
  @IsPositive({ message: 'O preço unitário deve ser maior que zero' })
  precoUnitarioUSD: number;
}

export class CreateOrderDto {
  @ApiProperty({ 
    description: 'ID do cliente',
    required: false,
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  @IsOptional()
  @IsMongoId({ message: 'ID do cliente inválido' })
  clienteId?: string;

  @ApiProperty({
    description: 'Data do pedido no formato ISO 8601',
    example: '2024-12-30T15:30:00.000Z'
  })
  @IsDateString({}, { message: 'Data deve estar no formato ISO 8601' })
  @IsNotEmpty({ message: 'A data do pedido é obrigatória' })
  data: string;

  @ApiProperty({ 
    type: [ItemDto],
    description: 'Lista de itens do pedido',
    minItems: 1,
    example: [
      {
        produto: 'Notebook Dell',
        quantidade: 2,
        precoUnitarioUSD: 999.99
      }
    ]
  })
  @IsArray({ message: 'Os itens devem ser uma lista' })
  @ArrayMinSize(1, { message: 'O pedido deve ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  itens: ItemDto[];
}

export class OrderDto {
  @ApiProperty({
    description: 'ID do pedido',
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  id: string;

  @ApiProperty({ 
    description: 'ID do cliente',
    example: '507f1f77bcf86cd799439013'
  })
  @IsString()
  @IsMongoId({ message: 'ID do cliente inválido' })
  clienteId: string;

  @ApiProperty({
    description: 'Data do pedido',
    example: '2024-12-30T15:30:00.000Z'
  })
  @IsDateString()
  data: Date;

  @ApiProperty({ 
    type: [ItemDto],
    description: 'Lista de itens do pedido'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  itens: ItemDto[];

  @ApiProperty({
    description: 'Valor total em USD',
    example: 1999.98
  })
  @IsNumber()
  valorTotalUSD: number;

  @ApiProperty({
    description: 'Valor total em BRL',
    example: 10987.24
  })
  @IsNumber()
  valorTotalBRL: number;

  @ApiProperty({
    description: 'URL do comprovante',
    required: false,
    example: 'https://s3.amazonaws.com/bucket/comprovante.pdf'
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL do comprovante inválida' })
  comprovanteURL?: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-12-30T15:30:00.000Z'
  })
  @IsDateString()
  createdAt: Date;
}

export class UpdateOrderDto {
  @ApiProperty({ 
    description: 'ID do cliente',
    required: false,
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  @IsOptional()
  @IsMongoId({ message: 'ID do cliente inválido' })
  clienteId?: string;

  @ApiProperty({
    description: 'Data do pedido no formato ISO 8601',
    required: false,
    example: '2024-12-30T15:30:00.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data deve estar no formato ISO 8601' })
  data?: string;

  @ApiProperty({ 
    type: [ItemDto],
    description: 'Lista de itens do pedido',
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Os itens devem ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  itens?: ItemDto[];

  @ApiProperty({
    description: 'Valor total em USD',
    required: false,
    example: 1999.98
  })
  @IsOptional()
  @IsNumber()
  valorTotalUSD?: number;

  @ApiProperty({
    description: 'Valor total em BRL',
    required: false,
    example: 10987.24
  })
  @IsOptional()
  @IsNumber()
  valorTotalBRL?: number;

  @ApiProperty({
    description: 'URL do comprovante',
    required: false,
    example: 'https://s3.amazonaws.com/bucket/comprovante.pdf'
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL do comprovante inválida' })
  comprovanteURL?: string;
}
