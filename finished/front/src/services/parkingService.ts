import http from './http';
import type { ParkingApplication, CreateParkingRequest } from '@/types/api';

export const parkingService = {
  getZones(): Promise<string[]> {
    return http.get<string[]>('/parking/zones').then((r) => r.data);
  },
  getApplications(citizenId: number): Promise<ParkingApplication[]> {
    return http
      .get<ParkingApplication[]>(`/parking/${citizenId}/applications`)
      .then((r) => r.data);
  },
  createApplication(
    citizenId: number,
    req: CreateParkingRequest,
  ): Promise<ParkingApplication> {
    return http
      .post<ParkingApplication>(`/parking/${citizenId}/applications`, req)
      .then((r) => r.data);
  },
};
