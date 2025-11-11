import { PaymentTypeEnum } from '../enums/payment.enum';
import { VehicleTypeEnum } from '../enums/vehicles.enum';

export interface Item {
  product: string;
  quantity: number;
}

export interface Coord {
  latitude: number;
  longitude: number;
  address: string;
  whoReceives: string;
  whoReceivesPhone: string;
  comments: string;
  type: string;
  items: Item[];
}

export interface CreateOrderRequest {
  dayToDeliver: string;
  weight: number;
  vehicleType: VehicleTypeEnum;
  coords: Coord[];
  payment: PaymentTypeEnum;
  requiresSign: boolean;
  requiresEvidences: boolean;
  metadata?: Record<string, any>;
}
