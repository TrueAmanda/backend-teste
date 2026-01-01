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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const axios_1 = __importDefault(require("axios"));
const queue_service_1 = require("../queue/queue.service");
const customers_service_1 = require("../customers/customers.service");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(model, queue, customers) {
        this.model = model;
        this.queue = queue;
        this.customers = customers;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async fetchUsdBrl() {
        try {
            const res = await axios_1.default.get('https://economia.awesomeapi.com.br/json/last/USD-BRL');
            const key = Object.keys(res.data)[0];
            const bid = parseFloat(res.data[key].bid);
            return bid;
        }
        catch (err) {
            this.logger.warn('Failed to fetch exchange rate, defaulting to 1');
            return 1;
        }
    }
    async create(dto) {
        const rate = await this.fetchUsdBrl();
        const valorTotalUSD = dto.itens.reduce((s, i) => s + i.precoUnitarioUSD * i.quantidade, 0);
        const valorTotalBRL = valorTotalUSD * rate;
        // Arredondar para 2 casas decimais
        const valorTotalUSDRounded = Math.round(valorTotalUSD * 100) / 100;
        const valorTotalBRLRounded = Math.round(valorTotalBRL * 100) / 100;
        const clienteId = dto.clienteId && mongoose_2.Types.ObjectId.isValid(dto.clienteId)
            ? new mongoose_2.Types.ObjectId(dto.clienteId)
            : dto.clienteId || null;
        const created = await this.model.create({
            clienteId,
            data: new Date(dto.data),
            itens: dto.itens,
            valorTotalUSD: valorTotalUSDRounded,
            valorTotalBRL: valorTotalBRLRounded,
        });
        // Buscar dados do cliente para notificação
        let customerData = { name: 'Cliente', email: 'cliente@exemplo.com' };
        if (clienteId) {
            try {
                const customer = await this.customers.findOne(clienteId.toString());
                if (customer) {
                    customerData = {
                        name: customer.nome,
                        email: customer.email
                    };
                }
            }
            catch (error) {
                this.logger.warn('Could not fetch customer data for notification', error);
            }
        }
        // Adicionar job de notificação por e-mail
        await this.queue.addNotification({
            orderId: created._id.toString(),
            customerName: customerData.name,
            customerEmail: customerData.email
        });
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
    async findOne(id) {
        const found = await this.model.findById(id).populate('clienteId').exec();
        if (!found)
            throw new common_1.NotFoundException('Order not found');
        return found;
    }
    async update(id, updateData) {
        const updated = await this.model
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('clienteId')
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Order not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.model.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Order not found');
        return { deleted: true };
    }
};
OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        queue_service_1.QueueService,
        customers_service_1.CustomersService])
], OrdersService);
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders.service.js.map