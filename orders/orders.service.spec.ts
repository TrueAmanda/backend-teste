import { OrdersService } from './orders.service';
import axios from 'axios';

jest.mock('axios');

describe('OrdersService (unit)', () => {
  it('calculates totals, saves order and enqueues receipt generation', async () => {
    // mock axios rate
    (axios as any).get.mockResolvedValue({ data: { USDBRL: { bid: '5' } } });

    const mockModel: any = {
      create: jest.fn(dto => ({ ...dto, _id: 'order123' })),
      find: jest.fn()
    };

    const mockQueue: any = { 
      addGenerateReceipt: jest.fn(),
      addNotification: jest.fn()
    };
    
    const mockCustomers: any = { 
      findOne: jest.fn().mockResolvedValue({ 
        _id: 'cust1', 
        nome: 'Ana', 
        email: 'a@a.com' 
      }) 
    };

    const svc = new OrdersService(mockModel, mockQueue, mockCustomers);

    const dto: any = {
      clienteId: 'cust1',
      data: new Date().toISOString(),
      itens: [{ produto: 'X', quantidade: 2, precoUnitarioUSD: 10 }]
    };

    const created = await svc.create(dto);

    expect(mockModel.create).toHaveBeenCalled();
    expect(created.valorTotalUSD).toBe(20);
    expect(created.valorTotalBRL).toBe(100);
    expect(mockQueue.addGenerateReceipt).toHaveBeenCalledWith({ orderId: 'order123' });
    expect(mockQueue.addNotification).not.toHaveBeenCalled(); // Removido notificação
  });

  it('should round totals to 2 decimal places', async () => {
    (axios as any).get.mockResolvedValue({ data: { USDBRL: { bid: '5.4876' } } });

    const mockModel: any = {
      create: jest.fn(dto => ({ ...dto, _id: 'order123' })),
      find: jest.fn()
    };

    const mockQueue: any = { 
      addGenerateReceipt: jest.fn(),
      addNotification: jest.fn()
    };
    
    const mockCustomers: any = { 
      findOne: jest.fn().mockResolvedValue({ 
        _id: 'cust1', 
        nome: 'Ana', 
        email: 'a@a.com' 
      }) 
    };

    const svc = new OrdersService(mockModel, mockQueue, mockCustomers);

    const dto: any = {
      clienteId: 'cust1',
      data: new Date().toISOString(),
      itens: [{ produto: 'X', quantidade: 1, precoUnitarioUSD: 10.99 }]
    };

    const created = await svc.create(dto);

    expect(created.valorTotalUSD).toBe(10.99);
    expect(created.valorTotalBRL).toBe(60.31); // 10.99 * 5.4876 = 60.2626 -> 60.31 (arredondado)
    expect(mockQueue.addGenerateReceipt).toHaveBeenCalledWith({ orderId: 'order123' });
  });
});
