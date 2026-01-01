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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrdersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const s3_service_1 = require("../s3/s3.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const receipt_service_1 = require("./receipt.service");
let OrdersController = OrdersController_1 = class OrdersController {
    constructor(svc, s3, receiptSvc) {
        this.svc = svc;
        this.s3 = s3;
        this.receiptSvc = receiptSvc;
        this.logger = new common_2.Logger(OrdersController_1.name);
    }
    async create(dto, req) {
        // Se clienteId não for fornecido, pega do token JWT
        const user = req.user;
        if (!dto.clienteId && user && user.sub) {
            dto.clienteId = user.sub;
        }
        return this.svc.create(dto);
    }
    async list(page = '1', limit = '10') {
        return this.svc.findAll(Number(page), Number(limit));
    }
    async get(id) {
        const order = await this.svc.findOne(id);
        if (!order) {
            throw new common_1.NotFoundException('Pedido não encontrado');
        }
        return order;
    }
    async uploadReceipt(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo foi enviado');
        }
        try {
            const url = await this.s3.uploadFile(file);
            const updatedOrder = await this.svc.update(id, {
                comprovanteURL: url
            });
            return {
                message: 'Comprovante enviado com sucesso',
                url,
                order: updatedOrder
            };
        }
        catch (error) {
            this.logger.error('Erro ao fazer upload do comprovante', error.stack);
            throw new common_1.InternalServerErrorException('Falha ao fazer upload do comprovante');
        }
    }
    async update(id, updateData) {
        return this.svc.update(id, updateData);
    }
    async remove(id) {
        return this.svc.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Cria um novo pedido' }),
    (0, swagger_1.ApiBody)({
        description: 'Dados para criação do pedido',
        type: create_order_dto_1.CreateOrderDto,
        examples: {
            exemplo_completo: {
                summary: 'Exemplo completo',
                value: {
                    clienteId: '695427c0de4192685d824768',
                    data: '2024-12-30T15:30:00.000Z',
                    itens: [
                        {
                            produto: 'Notebook Dell',
                            quantidade: 2,
                            precoUnitarioUSD: 999.99
                        }
                    ]
                }
            },
            exemplo_minimo: {
                summary: 'Exemplo mínimo',
                value: {
                    data: '2024-12-30T15:30:00.000Z',
                    itens: [
                        {
                            produto: 'Notebook Dell',
                            quantidade: 1,
                            precoUnitarioUSD: 999.99
                        }
                    ]
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pedido criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todos os pedidos com paginação' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Número da página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Itens por página' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de pedidos retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Parâmetros de paginação inválidos' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca um pedido pelo ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pedido encontrado com sucesso',
        schema: {
            type: 'object',
            example: {
                _id: "507f1f77bcf86cd799439012",
                clienteId: "507f1f77bcf86cd799439013",
                data: "2024-12-30T15:30:00.000Z",
                itens: [
                    {
                        produto: "Notebook Dell",
                        quantidade: 1,
                        precoUnitarioUSD: 999.99,
                        _id: "507f1f77bcf86cd799439014"
                    }
                ],
                valorTotalUSD: 999.99,
                valorTotalBRL: 5487.24,
                comprovanteURL: "https://s3.amazonaws.com/bucket/receipt.pdf",
                createdAt: "2024-12-30T15:30:00.000Z"
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID inválido' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/comprovante'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Faz upload do comprovante de pagamento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comprovante enviado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Arquivo não fornecido ou inválido' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Upload de comprovante',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
                return cb(new Error('Apenas arquivos JPG, PNG e PDF são permitidos!'), false);
            }
            cb(null, true);
        }
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "uploadReceipt", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza um pedido existente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pedido atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove um pedido' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pedido removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID inválido' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "remove", null);
OrdersController = OrdersController_1 = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        s3_service_1.S3Service,
        receipt_service_1.ReceiptService])
], OrdersController);
exports.OrdersController = OrdersController;
//# sourceMappingURL=orders.controller.js.map