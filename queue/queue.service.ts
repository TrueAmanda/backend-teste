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
    this.logger.log('Queue initialized');
  }

  private getConnection() {
    const url = this.cfg.get<string>('REDIS_URL');
    if (url) return { url };
    return {
      host: this.cfg.get<string>('REDIS_HOST') || '127.0.0.1',
      port: Number(this.cfg.get<number>('REDIS_PORT') || 6379)
    } as any;
  }

  async addNotification(payload: any) {
    await this.queue.add('send-email', payload);
    this.logger.log(`Enqueued notification job for ${payload.orderId}`);
  }

  async addGenerateReceipt(payload: any) {
    await this.queue.add('generate-receipt', payload);
    this.logger.log(`Enqueued generate-receipt job for ${payload.orderId}`);
  }
}
