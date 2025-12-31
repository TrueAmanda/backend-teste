import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import { ReceiptService } from '../orders/receipt.service';

@Injectable()
export class NotificationProcessor implements OnModuleDestroy {
  private worker: Worker;
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly maxRetries = 3;

  constructor(
    private cfg: ConfigService, 
    private receiptSvc: ReceiptService
  ) {
    const connection = this.getConnection();
    this.worker = new Worker(
      'notification',
      async (job: Job) => await this.processJob(job),
      { 
        connection,
        concurrency: 5,
      }
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} (${job.name}) completed`);
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Job ${job?.id} (${job?.name}) failed: ${error.message}`,
        error.stack
      );
    });

    this.logger.log('Notification worker started');
  }

  private async processJob(job: Job) {
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
    } catch (error) {
      jobLogger.error(`Error processing job ${job.id} (${job.name}): ${error.message}`, error.stack);
      
      if (job.attemptsMade < this.maxRetries) {
        jobLogger.warn(`Retrying job ${job.id} (attempt ${job.attemptsMade + 1}/${this.maxRetries})`);
        throw error;
      }
      
      jobLogger.error(`Job ${job.id} failed after ${this.maxRetries} attempts`);
      throw error;
    }
  }

  private async handleGenerateReceipt(job: Job) {
    const { orderId } = job.data;
    
    if (!orderId) {
      throw new Error('ID do pedido não fornecido');
    }

    this.logger.log(`Processando geração de recibo para o pedido ${orderId}`);
    
    try {
      await this.receiptSvc.generateAndUpload(orderId);
      this.logger.log(`Recibo gerado com sucesso para o pedido ${orderId}`);
    } catch (error) {
      this.logger.error(`Erro ao gerar recibo para o pedido ${orderId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getConnection() {
    const url = this.cfg.get<string>('REDIS_URL');
    if (url) return { url } as any;
    return {
      host: this.cfg.get<string>('REDIS_HOST') || '127.0.0.1',
      port: Number(this.cfg.get<number>('REDIS_PORT') || 6379)
    } as any;
  }

  async onModuleDestroy() {
    await this.worker?.close();
    this.logger.log('Notification worker stopped');
  }
}
