import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../orders/schemas/order.schema';
import { Customer } from '../customers/schemas/customer.schema';

interface TopClientsQuery {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  async getTopClients(query: TopClientsQuery = {}) {
    const {
      limit = 10,
      page = 1,
      startDate,
      endDate,
      minAmount
    } = query;

    // Validação dos parâmetros
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('O limite deve estar entre 1 e 100');
    }
    if (page < 1) {
      throw new BadRequestException('A página deve ser maior que 0');
    }

    // Construir o filtro de datas
    const dateFilter: any = {};
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
    const pipeline: any[] = [
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
    const total = metadata[0]?.total || 0;

    this.logger.debug(`Data: ${JSON.stringify(data)}`);
    this.logger.debug(`Total: ${total}`);

    // Obter detalhes dos clientes
    const customerIds = data.map((c: any) => c._id);
    const customers = await this.customerModel
      .find({ _id: { $in: customerIds } })
      .select('_id nome email pais createdAt')
      .lean();

    // Mapear resultados
    const clientesComDetalhes = data.map((customer: any) => {
      const customerData = customers.find(c => 
        c._id && customer._id && c._id.toString() === customer._id.toString()
      );
      
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

  async getSalesSummary(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
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
}
