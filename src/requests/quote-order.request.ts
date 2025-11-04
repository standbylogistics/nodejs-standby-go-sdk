import { VehicleTypeEnum } from '../enums/vehicles.enum';
import { Coord } from '../interfaces/coord.interface';

export interface QuoteOrderRequest {
  vehicleType: VehicleTypeEnum;
  weight: number;
  coords: Coord[];
}
