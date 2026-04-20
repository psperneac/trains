/**
 * Job offer representing a cargo delivery opportunity at a place.
 * These are ephemeral - generated periodically and not persisted.
 */
export interface JobOffer {
  /** Temporary ID for frontend keying */
  id: string;
  /** Type of cargo being transported */
  cargoType: string;
  /** Origin place template ID */
  startPlaceId: string;
  /** Destination place template ID */
  endPlaceId: string;
  /** Destination place name (for display) */
  destinationName?: string;
  /** Origin place name (for display) */
  originName?: string;
  /** Amount of cargo */
  load: number;
  /** Payment amount */
  pay: number;
  /** Payment currency type */
  payType: 'GOLD' | 'GEMS';
  /** When the offer expires */
  expiresAt?: Date;
}