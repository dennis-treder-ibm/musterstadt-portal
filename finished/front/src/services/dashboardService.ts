import http from './http';
import type { DashboardData } from '@/types/api';

export const dashboardService = {
  get(citizenId: number): Promise<DashboardData> {
    return http.get<DashboardData>(`/dashboard/${citizenId}`).then((r) => r.data);
  },
};
