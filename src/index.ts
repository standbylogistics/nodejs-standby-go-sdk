import { AxiosInstance } from 'axios';

import { HttpClient, StandByClientConfig } from './http';
import { Order } from './interfaces/order.interface';
import { CreateOrderRequest } from './requests/create-order.request';
import { FindOrdersRequest } from './requests/find-orders.request';
import { QuoteOrderRequest } from './requests/quote-order.request';
import { CreateOrderResponse } from './responses/create-order.response';
import { QuoteResponse } from './responses/quote.response';

export class StandBySDK {
  private readonly client: AxiosInstance;

  constructor(config: StandByClientConfig) {
    const { client } = new HttpClient(config);
    this.client = client;
  }

  async findAll(dto: FindOrdersRequest): Promise<Order[]> {
    const { data } = await this.client.get('/customers/orders', {
      params: {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });
    return data;
  }

  async findOne(orderId: string): Promise<Order> {
    const { data } = await this.client.get(`/customers/orders/${orderId}`);
    return data;
  }

  async quote(dto: QuoteOrderRequest): Promise<QuoteResponse> {
    const { data } = await this.client.post('/orders/rates/quote', {
      ...dto,
      needLoader: false,
    });
    return data;
  }

  async create(dto: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { data } = await this.client.post('/orders', {
      ...dto,
      needLoader: false,
    });
    return data;
  }

  async delete(orderId: string): Promise<void> {
    await this.client.delete(`/orders/${orderId}/cancel`);
  }
}

export default StandBySDK;
export type { StandByClientConfig } from './http';
export * from './interfaces/order.interface';
export * from './requests/create-order.request';
export * from './requests/find-orders.request';
export * from './requests/quote-order.request';
export * from './responses/create-order.response';
export * from './responses/quote.response';
