export interface DeliveryPoint {
  id: string;
  type: string;
  position: number;
}

export interface CreateOrderResponse {
  id: string;
  orderNumber: number;
  deliveryPoints: DeliveryPoint[];
}
