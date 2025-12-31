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
var ReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../orders/schemas/order.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
let ReportsService = ReportsService_1 = class ReportsService {
    constructor(orderModel, customerModel) {
        this.orderModel = orderModel;
        this.customerModel = customerModel;
        this.logger = new common_1.Logger(ReportsService_1.name);
    }
    async getTopClients(query = {}) {
        var _a;
        const { limit = 10, page = 1, startDate, endDate, minAmount } = query;
        // Validação dos parâmetros
        if (limit < 1 || limit > 100) {
            throw new common_1.BadRequestException('O limite deve estar entre 1 e 100');
        }
        if (page < 1) {
            throw new common_1.BadRequestException('A página deve ser maior que 0');
        }
        // Construir o filtro de datas
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.data = {};
            if (startDate) {
                dateFilter.data.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.data.$lte = new Date(endDate);
            }
        }
        // Pipeline de agregação
        const pipeline = [
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
            {
                $addFields: {
                    // Normalizar nomes de campos para lidar com ambos os formatos
                    clienteIdNormalizado: {
                        $ifNull: [
                            { $toString: '$clienteId' },
                            { $toString: '$customerId' }
                        ]
                    },
                    valorTotalBRLNormalizado: { $ifNull: ['$valorTotalBRL', '$totalBRL'] },
                    valorTotalUSDNormalizado: { $ifNull: ['$valorTotalUSD', '$totalUSD'] },
                    dataNormalizada: { $ifNull: ['$data', '$date'] }
                }
            },
            {
                $match: {
                    clienteIdNormalizado: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$clienteIdNormalizado',
                    totalGastoBRL: { $sum: '$valorTotalBRLNormalizado' },
                    totalGastoUSD: { $sum: '$valorTotalUSDNormalizado' },
                    totalPedidos: { $sum: 1 },
                    dataUltimoPedido: { $max: '$dataNormalizada' },
                    valorMedioPedido: { $avg: '$valorTotalBRLNormalizado' }
                }
            },
            {
                $addFields: {
                    totalGastoBRL: { $round: ['$totalGastoBRL', 2] },
                    totalGastoUSD: { $round: ['$totalGastoUSD', 2] },
                    valorMedioPedido: { $round: ['$valorMedioPedido', 2] }
                }
            },
            ...(minAmount ? [{ $match: { totalGastoBRL: { $gte: minAmount } } }] : []),
            { $sort: { totalGastoBRL: -1 } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit }
                    ]
                }
            }
        ];
        this.logger.debug(`Executing aggregation with pipeline: ${JSON.stringify(pipeline)}`);
        const result = await this.orderModel.aggregate(pipeline);
        this.logger.debug(`Aggregation result: ${JSON.stringify(result)}`);
        const [aggResult] = result;
        const { data = [], metadata = [] } = aggResult;
        const total = ((_a = metadata[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        this.logger.debug(`Data: ${JSON.stringify(data)}`);
        this.logger.debug(`Total: ${total}`);
        // Obter detalhes dos clientes
        const customerIds = data.map((c) => c._id);
        const customers = await this.customerModel
            .find({ _id: { $in: customerIds } })
            .select('_id nome email pais createdAt')
            .lean();
        // Mapear resultados
        const clientesComDetalhes = data.map((customer) => {
            const customerData = customers.find(c => c._id && customer._id && c._id.toString() === customer._id.toString());
            return {
                cliente: customerData ? {
                    id: customerData._id,
                    nome: customerData.nome,
                    email: customerData.email,
                    pais: customerData.pais,
                    dataCadastro: customerData.createdAt
                } : { id: customer._id || 'unknown' },
                metricas: {
                    totalGastoBRL: Number(customer.totalGastoBRL.toFixed(2)),
                    totalGastoUSD: Number(customer.totalGastoUSD.toFixed(2)),
                    totalPedidos: customer.totalPedidos,
                    valorMedioPedido: Number(customer.valorMedioPedido.toFixed(2)),
                    dataUltimoPedido: customer.dataUltimoPedido
                }
            };
        });
        return {
            clientes: clientesComDetalhes,
            paginacao: {
                pagina: page,
                limite: limit,
                total: total,
                totalPaginas: Math.ceil(total / limit),
                proximaPagina: page < Math.ceil(total / limit) ? page + 1 : null,
                paginaAnterior: page > 1 ? page - 1 : null
            }
        };
    }
    async getSalesSummary(startDate, endDate) {
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.$or = [
                { data: {} },
                { date: {} }
            ];
            if (startDate) {
                dateFilter.$or[0].data.$gte = new Date(startDate);
                dateFilter.$or[1].date.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.$or[0].data.$lte = new Date(endDate);
                dateFilter.$or[1].date.$lte = new Date(endDate);
            }
        }
        const summary = await this.orderModel.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
            {
                $addFields: {
                    // Normalizar nomes de campos
                    valorTotalBRLNormalizado: { $ifNull: ['$valorTotalBRL', '$totalBRL'] },
                    valorTotalUSDNormalizado: { $ifNull: ['$valorTotalUSD', '$totalUSD'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPedidos: { $sum: 1 },
                    totalValorBRL: { $sum: '$valorTotalBRLNormalizado' },
                    totalValorUSD: { $sum: '$valorTotalUSDNormalizado' },
                    valorMedioPedido: { $avg: '$valorTotalBRLNormalizado' },
                    pedidoMaisCaro: { $max: '$valorTotalBRLNormalizado' },
                    pedidoMaisBarato: { $min: '$valorTotalBRLNormalizado' }
                }
            },
            {
                $addFields: {
                    totalValorBRL: { $round: ['$totalValorBRL', 2] },
                    totalValorUSD: { $round: ['$totalValorUSD', 2] },
                    valorMedioPedido: { $round: ['$valorMedioPedido', 2] },
                    pedidoMaisCaro: { $round: ['$pedidoMaisCaro', 2] },
                    pedidoMaisBarato: { $round: ['$pedidoMaisBarato', 2] }
                }
            }
        ]);
        return summary[0] || {
            totalPedidos: 0,
            totalValorBRL: 0,
            totalValorUSD: 0,
            valorMedioPedido: 0,
            pedidoMaisCaro: 0,
            pedidoMaisBarato: 0
        };
    }
};
ReportsService = ReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReportsService);
exports.ReportsService = ReportsService;
//# sourceMappingURL=reports.service.js.map