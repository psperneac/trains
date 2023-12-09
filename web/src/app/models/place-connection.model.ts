import { PlaceDto } from './place.model';

export class PlaceConnectionDto {
  id?: string;
  type: string;
  name: string;
  description: string;
  content: any;

  startId: string;
  endId: string;
}
