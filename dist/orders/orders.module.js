"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const order_schema_1 = require("./schemas/order.schema");
const customers_module_1 = require("../customers/customers.module");
const queue_module_1 = require("../queue/queue.module");
const s3_module_1 = require("../s3/s3.module");
const auth_module_1 = require("../auth/auth.module");
const receipt_service_1 = require("./receipt.service");
let OrdersModule = class OrdersModule {
};
OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema }]),
            customers_module_1.CustomersModule,
            queue_module_1.QueueModule,
            s3_module_1.S3Module,
            auth_module_1.AuthModule
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService, receipt_service_1.ReceiptService],
        exports: [orders_service_1.OrdersService, receipt_service_1.ReceiptService]
    })
], OrdersModule);
exports.OrdersModule = OrdersModule;
//# sourceMappingURL=orders.module.js.map