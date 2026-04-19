export interface VehicleDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;

  engineMax: number;
  engineLoad: number;
  engineFuel: number;

  auxMax: number;
  auxLoad: number;
  auxFuel: number;

  speed: number;
  gameId: string;
  priceGold: number;
  priceGems: number;
  fuelBaseBurn: number;
  fuelPerLoadBurn: number;
}