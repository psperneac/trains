import { AbstractEntity } from '../../../utils/abstract.entity';

export class VehicleType extends AbstractEntity {
  type: string;
  name: string;
  description: string;
  content: any;
}

export class VehicleTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}
