import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { CustomersModule } from '../customers/customers.module';
import { QueueModule } from '../queue/queue.module';
import { S3Module } from '../s3/s3.module';
import { AuthModule } from '../auth/auth.module';
import { ReceiptService } from './receipt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CustomersModule,
    QueueModule,
    S3Module,
    AuthModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ReceiptService],
  exports: [OrdersService, ReceiptService]
})
export class OrdersModule {}
