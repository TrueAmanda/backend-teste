import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleInit {
  private queue: Queue;
  private readonly logger = new Logger(QueueService.name);

  constructor(private cfg: ConfigService) {}

  onModuleInit() {
    const connection = this.getConnection();
    this.queue = new Queue('notification', { connection });
    this.logger.log('Queue initialized with Redis container');
  }

  private getConnection() {
    const url = this.cfg.get<string>('REDIS_URL');
    if (!url) {
      throw new Error('REDIS_URL é obrigatório para o processamento assíncrono');
    }
    return { url } as any;
  }

  async addNotification(payload: any) {
    await this.queue.add('send-email', payload);
    this.logger.log(`Enqueued notification job for order ${payload.orderId}`);
  }

  async addGenerateReceipt(payload: any) {
    await this.queue.add('generate-receipt', payload);
    this.logger.log(`Enqueued generate-receipt job for order ${payload.orderId}`);
  }
}
