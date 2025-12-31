import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Customer {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  pais: string;

  @Prop()
  createdAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
