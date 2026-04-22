export type TripStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface TripEntity {
  id: string;
  origin: string;
  destination: string;
  status: TripStatus;
  scheduledDate: string | Date;
  clientName: string;
  unitId?: string;
  operatorName?: string;
  createdAt: string | Date;
}

export interface TripsSummary {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
}
