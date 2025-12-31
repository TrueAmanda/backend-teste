import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './notification.processor';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ConfigModule, forwardRef(() => OrdersModule)],
  providers: [QueueService, NotificationProcessor],
  exports: [QueueService]
})
export class QueueModule {}
