import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(@InjectModel(Customer.name) private model: Model<CustomerDocument>) {}

  create(dto: CreateCustomerDto) {
    return this.model.create(dto);
  }

  findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return this.model
      .find()
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(id: string) {
    const found = await this.model.findById(id).exec();
    if (!found) throw new NotFoundException('Customer not found');
    return found;
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).exec();
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Customer not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Customer not found');
    return { deleted: true };
  }
}
