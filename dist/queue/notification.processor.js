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
var NotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const receipt_service_1 = require("../orders/receipt.service");
let NotificationProcessor = NotificationProcessor_1 = class NotificationProcessor {
    constructor(cfg, receiptSvc) {
        this.cfg = cfg;
        this.receiptSvc = receiptSvc;
        this.logger = new common_1.Logger(NotificationProcessor_1.name);
        this.maxRetries = 3;
        const connection = this.getConnection();
        this.worker = new bullmq_1.Worker('notification', async (job) => await this.processJob(job), {
            connection,
            concurrency: 5,
        });
        this.worker.on('completed', (job) => {
            this.logger.log(`Job ${job.id} (${job.name}) completed`);
        });
        this.worker.on('failed', (job, error) => {
            this.logger.error(`Job ${job === null || job === void 0 ? void 0 : job.id} (${job === null || job === void 0 ? void 0 : job.name}) failed: ${error.message}`, error.stack);
        });
        this.logger.log('Notification worker started');
    }
    async processJob(job) {
        const jobLogger = this.logger;
        jobLogger.debug(`Processing job ${job.id} (${job.name})`);
        try {
            switch (job.name) {
                case 'generate-receipt':
                    await this.handleGenerateReceipt(job);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.name}`);
            }
        }
        catch (error) {
            jobLogger.error(`Error processing job ${job.id} (${job.name}): ${error.message}`, error.stack);
            if (job.attemptsMade < this.maxRetries) {
                jobLogger.warn(`Retrying job ${job.id} (attempt ${job.attemptsMade + 1}/${this.maxRetries})`);
                throw error;
            }
            jobLogger.error(`Job ${job.id} failed after ${this.maxRetries} attempts`);
            throw error;
        }
    }
    async handleGenerateReceipt(job) {
        const { orderId } = job.data;
        if (!orderId) {
            throw new Error('ID do pedido não fornecido');
        }
        this.logger.log(`Processando geração de recibo para o pedido ${orderId}`);
        try {
            await this.receiptSvc.generateAndUpload(orderId);
            this.logger.log(`Recibo gerado com sucesso para o pedido ${orderId}`);
        }
        catch (error) {
            this.logger.error(`Erro ao gerar recibo para o pedido ${orderId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    getConnection() {
        const url = this.cfg.get('REDIS_URL');
        if (url)
            return { url };
        return {
            host: this.cfg.get('REDIS_HOST') || '127.0.0.1',
            port: Number(this.cfg.get('REDIS_PORT') || 6379)
        };
    }
    async onModuleDestroy() {
        var _a;
        await ((_a = this.worker) === null || _a === void 0 ? void 0 : _a.close());
        this.logger.log('Notification worker stopped');
    }
};
NotificationProcessor = NotificationProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        receipt_service_1.ReceiptService])
], NotificationProcessor);
exports.NotificationProcessor = NotificationProcessor;
//# sourceMappingURL=notification.processor.js.map