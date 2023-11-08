import { AbstractEntity } from '../../../utils/abstract.entity';

export class PlaceType extends AbstractEntity {
  type: string;
  name: string;
  description: string;
  content: any;
}

export class PlaceTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}
