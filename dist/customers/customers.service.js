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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const customer_schema_1 = require("./schemas/customer.schema");
let CustomersService = class CustomersService {
    constructor(model) {
        this.model = model;
    }
    create(dto) {
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
    async findOne(id) {
        const found = await this.model.findById(id).exec();
        if (!found)
            throw new common_1.NotFoundException('Customer not found');
        return found;
    }
    async findByEmail(email) {
        return this.model.findOne({ email }).exec();
    }
    async update(id, dto) {
        const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Customer not found');
        return updated;
    }
    async remove(id) {
        const res = await this.model.findByIdAndDelete(id).exec();
        if (!res)
            throw new common_1.NotFoundException('Customer not found');
        return { deleted: true };
    }
};
CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CustomersService);
exports.CustomersService = CustomersService;
//# sourceMappingURL=customers.service.js.map