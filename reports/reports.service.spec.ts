import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from '../orders/schemas/order.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let orderModel: Model<Order>;
  let customerModel: Model<Customer>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            aggregate: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(Customer.name),
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

    service = module.get<ReportsService>(ReportsService);
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
    customerModel = module.get<Model<Customer>>(getModelToken(Customer.name));
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

      jest.spyOn(orderModel, 'aggregate').mockResolvedValue(mockAggregation as any);

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
        .rejects.toThrow(BadRequestException);
      
      await expect(service.getTopClients({ limit: 101 }))
        .rejects.toThrow(BadRequestException);
    });

    it('deve validar número da página', async () => {
      // Act & Assert
      await expect(service.getTopClients({ page: 0 }))
        .rejects.toThrow(BadRequestException);
    });

    it('deve filtrar por período', async () => {
      // Arrange
      const query = {
        limit: 10,
        page: 1,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      jest.spyOn(orderModel, 'aggregate').mockResolvedValue([{ data: [], metadata: [] }] as any);

      // Act
      await service.getTopClients(query);

      // Assert
      expect(orderModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              data: expect.objectContaining({
                $gte: new Date('2024-01-01'),
                $lte: new Date('2024-12-31')
              })
            })
          })
        ])
      );
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

      jest.spyOn(orderModel, 'aggregate').mockResolvedValue(mockSummary as any);

      // Act
      const result = await service.getSalesSummary();

      // Assert
      expect(result.totalPedidos).toBe(10);
      expect(result.totalValorBRL).toBe(1000);
      expect(result.totalValorUSD).toBe(200);
    });

    it('deve retornar valores zerados quando não houver pedidos', async () => {
      // Arrange
      jest.spyOn(orderModel, 'aggregate').mockResolvedValue([] as any);

      // Act
      const result = await service.getSalesSummary();

      // Assert
      expect(result.totalPedidos).toBe(0);
      expect(result.totalValorBRL).toBe(0);
      expect(result.totalValorUSD).toBe(0);
    });
  });
});
