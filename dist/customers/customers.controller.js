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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const swagger_1 = require("@nestjs/swagger");
let CustomersController = class CustomersController {
    constructor(svc) {
        this.svc = svc;
    }
    create(dto) {
        return this.svc.create(dto);
    }
    list(page = '1', limit = '10') {
        return this.svc.findAll(Number(page), Number(limit));
    }
    get(id) {
        return this.svc.findOne(id);
    }
    update(id, dto) {
        return this.svc.update(id, dto);
    }
    remove(id) {
        return this.svc.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cria um novo cliente' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cliente criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todos os clientes' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Número da página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Itens por página' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de clientes retornada com sucesso' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca um cliente pelo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cliente encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cliente não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID inválido' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza um cliente existente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cliente atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cliente não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove um cliente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cliente removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cliente não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID inválido' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "remove", null);
CustomersController = __decorate([
    (0, swagger_1.ApiTags)('customers'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
exports.CustomersController = CustomersController;
//# sourceMappingURL=customers.controller.js.map