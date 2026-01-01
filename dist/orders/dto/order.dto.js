"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderDto = exports.OrderDto = exports.CreateOrderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ItemDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome do produto',
        example: 'Notebook Dell'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do produto é obrigatório' }),
    (0, class_validator_1.MaxLength)(255, { message: 'O nome do produto deve ter no máximo 255 caracteres' }),
    __metadata("design:type", String)
], ItemDto.prototype, "produto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantidade do item',
        example: 2,
        minimum: 1
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'A quantidade deve ser um número' }),
    (0, class_validator_1.IsPositive)({ message: 'A quantidade deve ser maior que zero' }),
    (0, class_validator_1.IsInt)({ message: 'A quantidade deve ser um número inteiro' }),
    __metadata("design:type", Number)
], ItemDto.prototype, "quantidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preço unitário em USD',
        example: 999.99,
        minimum: 0.01
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'O preço unitário deve ser um número' }),
    (0, class_validator_1.IsPositive)({ message: 'O preço unitário deve ser maior que zero' }),
    __metadata("design:type", Number)
], ItemDto.prototype, "precoUnitarioUSD", void 0);
class CreateOrderDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do cliente',
        required: false,
        example: '507f1f77bcf86cd799439012'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'ID do cliente inválido' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "clienteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data do pedido no formato ISO 8601',
        example: '2024-12-30T15:30:00.000Z'
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Data deve estar no formato ISO 8601' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A data do pedido é obrigatória' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
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
    }),
    (0, class_validator_1.IsArray)({ message: 'Os itens devem ser uma lista' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'O pedido deve ter pelo menos um item' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "itens", void 0);
exports.CreateOrderDto = CreateOrderDto;
class OrderDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do pedido',
        example: '507f1f77bcf86cd799439012'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do cliente',
        example: '507f1f77bcf86cd799439013'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsMongoId)({ message: 'ID do cliente inválido' }),
    __metadata("design:type", String)
], OrderDto.prototype, "clienteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data do pedido',
        example: '2024-12-30T15:30:00.000Z'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], OrderDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ItemDto],
        description: 'Lista de itens do pedido'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ItemDto),
    __metadata("design:type", Array)
], OrderDto.prototype, "itens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor total em USD',
        example: 1999.98
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderDto.prototype, "valorTotalUSD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor total em BRL',
        example: 10987.24
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderDto.prototype, "valorTotalBRL", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL do comprovante',
        required: false,
        example: 'https://s3.amazonaws.com/bucket/comprovante.pdf'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'URL do comprovante inválida' }),
    __metadata("design:type", String)
], OrderDto.prototype, "comprovanteURL", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data de criação',
        example: '2024-12-30T15:30:00.000Z'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], OrderDto.prototype, "createdAt", void 0);
exports.OrderDto = OrderDto;
class UpdateOrderDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do cliente',
        required: false,
        example: '507f1f77bcf86cd799439012'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ message: 'ID do cliente inválido' }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "clienteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data do pedido no formato ISO 8601',
        required: false,
        example: '2024-12-30T15:30:00.000Z'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data deve estar no formato ISO 8601' }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ItemDto],
        description: 'Lista de itens do pedido',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Os itens devem ser uma lista' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ItemDto),
    __metadata("design:type", Array)
], UpdateOrderDto.prototype, "itens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor total em USD',
        required: false,
        example: 1999.98
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "valorTotalUSD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor total em BRL',
        required: false,
        example: 10987.24
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "valorTotalBRL", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL do comprovante',
        required: false,
        example: 'https://s3.amazonaws.com/bucket/comprovante.pdf'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'URL do comprovante inválida' }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "comprovanteURL", void 0);
exports.UpdateOrderDto = UpdateOrderDto;
//# sourceMappingURL=order.dto.js.map