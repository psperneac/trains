

export interface JobDto {
  id: string;
  name: string;
  description: string;
  type: string;
  startId: string;
  endId: string;
  load: number;
  payType: string;
  pay: number;
  startTime: Date;
}
