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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getTopClients(query) {
        return this.reportsService.getTopClients(query);
    }
    async getSalesSummary(query) {
        const { startDate, endDate } = query;
        return this.reportsService.getSalesSummary(startDate, endDate);
    }
};
__decorate([
    (0, common_1.Get)('top-clientes'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lista os clientes que mais gastaram ordenados por valor total',
        description: 'Retorna uma lista paginada dos clientes com maiores gastos, com filtros opcionais de período e valor mínimo'
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Número de clientes a retornar (1-100)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Número da página' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Data inicial (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'Data final (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'minAmount', required: false, type: Number, description: 'Valor mínimo gasto' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de top clientes retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Parâmetros inválidos' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTopClients", null);
__decorate([
    (0, common_1.Get)('resumo-vendas'),
    (0, swagger_1.ApiOperation)({
        summary: 'Retorna um resumo das vendas',
        description: 'Retorna estatísticas gerais de vendas com filtros opcionais de período'
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Data inicial (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'Data final (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumo de vendas retornado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Parâmetros inválidos' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getSalesSummary", null);
ReportsController = __decorate([
    (0, swagger_1.ApiTags)('relatorios'),
    (0, common_1.Controller)('relatorios'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
exports.ReportsController = ReportsController;
//# sourceMappingURL=reports.controller.js.map