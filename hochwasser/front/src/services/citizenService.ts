import http from './http';
import type { Citizen } from '@/types/api';

export const citizenService = {
  getById(id: number): Promise<Citizen> {
    return http.get<Citizen>(`/citizens/${id}`).then((r) => r.data);
  },
  listAll(): Promise<Citizen[]> {
    return http.get<Citizen[]>('/citizens').then((r) => r.data);
  },
};
