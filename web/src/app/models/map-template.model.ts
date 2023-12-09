export interface MapTemplateDto {
  id?: string;
  name: string;
  description: string;
  content: any;

  places?: string[];   // MapPlace
  placeConnections?: string[];   // MapPlaceConnection
}
