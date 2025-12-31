import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import axios from 'axios';
import { QueueService } from '../queue/queue.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private model: Model<OrderDocument>,
    private queue: QueueService,
    private customers: CustomersService
  ) {}

  private async fetchUsdBrl(): Promise<number> {
    try {
      const res = await axios.get('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const key = Object.keys(res.data)[0];
      const bid = parseFloat(res.data[key].bid);
      return bid;
    } catch (err) {
      this.logger.warn('Failed to fetch exchange rate, defaulting to 1');
      return 1;
    }
  }

  async create(dto: CreateOrderDto) {
    const rate = await this.fetchUsdBrl();
    const valorTotalUSD = dto.itens.reduce((s, i) => s + i.precoUnitarioUSD * i.quantidade, 0);
    const valorTotalBRL = valorTotalUSD * rate;

    // Arredondar para 2 casas decimais
    const valorTotalUSDRounded = Math.round(valorTotalUSD * 100) / 100;
    const valorTotalBRLRounded = Math.round(valorTotalBRL * 100) / 100;

    const clienteId = dto.clienteId && Types.ObjectId.isValid(dto.clienteId) 
      ? new Types.ObjectId(dto.clienteId) 
      : dto.clienteId || null;

    const created = await this.model.create({
      clienteId,
      data: new Date(dto.data as any),
      itens: dto.itens,
      valorTotalUSD: valorTotalUSDRounded,
      valorTotalBRL: valorTotalBRLRounded,
    } as unknown as Partial<Order>);

    // enqueue receipt generation (async background job)
    this.queue.addGenerateReceipt({ orderId: created._id.toString() });

    return created;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model
        .find()
        .populate('clienteId')
        .sort({ data: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments().exec()
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    };
  }

  async findOne(id: string) {
    const found = await this.model.findById(id).populate('clienteId').exec();
    if (!found) throw new NotFoundException('Order not found');
    return found;
  }

  async update(id: string, updateData: any) {
    const updated = await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('clienteId')
      .exec();
      
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }
}
