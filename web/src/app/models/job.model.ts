export enum JobType {
  DELIVERY = 'delivery',
  PASSENGER = 'passenger',
  REPAIR = 'repair',
  RESCUE = 'rescue',
  TOW = 'tow',
}

export enum PayType {
  GOLD = 'gold',
  TOKEN = 'token',
  CRATE = 'crate',
  MATERIAL = 'material',
}

export interface JobDto {
  id?: string;
  name: string;
  description: string;
  type: string;
  startId: string;
  endId: string;
  load: number;
  payType: string;
  pay: number;
  startTime: string;
  content: any;
}
