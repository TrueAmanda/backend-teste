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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
let QueueService = QueueService_1 = class QueueService {
    constructor(cfg) {
        this.cfg = cfg;
        this.logger = new common_1.Logger(QueueService_1.name);
    }
    onModuleInit() {
        const connection = this.getConnection();
        this.queue = new bullmq_1.Queue('notification', { connection });
        this.logger.log('Queue initialized with Redis container');
    }
    getConnection() {
        const url = this.cfg.get('REDIS_URL');
        if (!url) {
            throw new Error('REDIS_URL é obrigatório para o processamento assíncrono');
        }
        return { url };
    }
    async addNotification(payload) {
        await this.queue.add('send-email', payload);
        this.logger.log(`Enqueued notification job for order ${payload.orderId}`);
    }
    async addGenerateReceipt(payload) {
        await this.queue.add('generate-receipt', payload);
        this.logger.log(`Enqueued generate-receipt job for order ${payload.orderId}`);
    }
};
QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
exports.QueueService = QueueService;
//# sourceMappingURL=queue.service.js.map