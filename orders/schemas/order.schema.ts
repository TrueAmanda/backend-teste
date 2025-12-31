import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

class Item {
  produto: string;
  quantidade: number;
  precoUnitarioUSD: number;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  clienteId: Types.ObjectId;

  @Prop({ required: true })
  data: Date;

  @Prop({ type: [{ produto: String, quantidade: Number, precoUnitarioUSD: Number }], default: [] })
  itens: Item[];

  @Prop()
  valorTotalUSD: number;

  @Prop()
  valorTotalBRL: number;

  @Prop({ default: null })
  comprovanteURL?: string;

  @Prop()
  createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
