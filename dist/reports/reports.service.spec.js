"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const reports_service_1 = require("./reports.service");
const mongoose_1 = require("@nestjs/mongoose");
const order_schema_1 = require("../orders/schemas/order.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const common_1 = require("@nestjs/common");
describe('ReportsService', () => {
    let service;
    let orderModel;
    let customerModel;
    const mockCustomer = {
        _id: '507f1f77bcf86cd799439012',
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        pais: 'Brasil',
        createdAt: new Date()
    };
    const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        clienteId: '507f1f77bcf86cd799439012',
        data: new Date(),
        itens: [{
                produto: 'Produto Teste',
                quantidade: 2,
                precoUnitarioUSD: 10.5
            }],
        valorTotalUSD: 21,
        valorTotalBRL: 105
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                reports_service_1.ReportsService,
                {
                    provide: (0, mongoose_1.getModelToken)(order_schema_1.Order.name),
                    useValue: {
                        aggregate: jest.fn(),
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, mongoose_1.getModelToken)(customer_schema_1.Customer.name),
                    useValue: {
                        find: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                lean: jest.fn().mockResolvedValue([mockCustomer])
                            })
                        }),
                    },
                },
            ],
        }).compile();
        service = module.get(reports_service_1.ReportsService);
        orderModel = module.get((0, mongoose_1.getModelToken)(order_schema_1.Order.name));
        customerModel = module.get((0, mongoose_1.getModelToken)(customer_schema_1.Customer.name));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getTopClients', () => {
        it('deve retornar top clientes com paginação', async () => {
            // Arrange
            const mockAggregation = [
                {
                    data: [
                        {
                            _id: mockCustomer._id,
                            totalGastoBRL: 105.00,
                            totalGastoUSD: 21.00,
                            totalPedidos: 1,
                            valorMedioPedido: 105.00,
                            dataUltimoPedido: new Date()
                        }
                    ],
                    metadata: [{ total: 1 }]
                }
            ];
            jest.spyOn(orderModel, 'aggregate').mockResolvedValue(mockAggregation);
            // Act
            const result = await service.getTopClients({ limit: 10, page: 1 });
            // Assert
            expect(result.clientes).toHaveLength(1);
            expect(result.clientes[0].cliente.nome).toBe('João Silva');
            expect(result.clientes[0].metricas.totalGastoBRL).toBe(105);
            expect(result.paginacao.total).toBe(1);
            expect(result.paginacao.pagina).toBe(1);
        });
        it('deve validar limite de clientes', async () => {
            // Act & Assert
            await expect(service.getTopClients({ limit: 0 }))
                .rejects.toThrow(common_1.BadRequestException);
            await expect(service.getTopClients({ limit: 101 }))
                .rejects.toThrow(common_1.BadRequestException);
        });
        it('deve validar número da página', async () => {
            // Act & Assert
            await expect(service.getTopClients({ page: 0 }))
                .rejects.toThrow(common_1.BadRequestException);
        });
        it('deve filtrar por período', async () => {
            // Arrange
            const query = {
                limit: 10,
                page: 1,
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            };
            jest.spyOn(orderModel, 'aggregate').mockResolvedValue([{ data: [], metadata: [] }]);
            // Act
            await service.getTopClients(query);
            // Assert
            expect(orderModel.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({
                    $match: expect.objectContaining({
                        data: expect.objectContaining({
                            $gte: new Date('2024-01-01'),
                            $lte: new Date('2024-12-31')
                        })
                    })
                })
            ]));
        });
    });
    describe('getSalesSummary', () => {
        it('deve retornar resumo de vendas', async () => {
            // Arrange
            const mockSummary = [{
                    totalPedidos: 10,
                    totalValorBRL: 1000,
                    totalValorUSD: 200,
                    valorMedioPedido: 100,
                    pedidoMaisCaro: 500,
                    pedidoMaisBarato: 50
                }];
            jest.spyOn(orderModel, 'aggregate').mockResolvedValue(mockSummary);
            // Act
            const result = await service.getSalesSummary();
            // Assert
            expect(result.totalPedidos).toBe(10);
            expect(result.totalValorBRL).toBe(1000);
            expect(result.totalValorUSD).toBe(200);
        });
        it('deve retornar valores zerados quando não houver pedidos', async () => {
            // Arrange
            jest.spyOn(orderModel, 'aggregate').mockResolvedValue([]);
            // Act
            const result = await service.getSalesSummary();
            // Assert
            expect(result.totalPedidos).toBe(0);
            expect(result.totalValorBRL).toBe(0);
            expect(result.totalValorUSD).toBe(0);
        });
    });
});
//# sourceMappingURL=reports.service.spec.js.map