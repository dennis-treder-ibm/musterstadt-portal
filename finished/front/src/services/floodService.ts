import http from './http';
import type { FloodApplication, CreateFloodRequest } from '@/types/api';

export const floodService = {
  getApplications(citizenId: number): Promise<FloodApplication[]> {
    return http
      .get<FloodApplication[]>(`/flood/${citizenId}/applications`)
      .then((r) => r.data);
  },
  createApplication(citizenId: number, req: CreateFloodRequest): Promise<FloodApplication> {
    return http
      .post<FloodApplication>(`/flood/${citizenId}/applications`, req)
      .then((r) => r.data);
  },
};
