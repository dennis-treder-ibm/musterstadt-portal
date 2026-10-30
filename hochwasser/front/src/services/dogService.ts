import http from './http';
import type { DogRegistration, RegisterDogRequest } from '@/types/api';

export const dogService = {
  getRegistrations(citizenId: number): Promise<DogRegistration[]> {
    return http
      .get<DogRegistration[]>(`/dogs/${citizenId}`)
      .then((r) => r.data);
  },
  search(citizenId: number, q: string): Promise<DogRegistration[]> {
    return http
      .get<DogRegistration[]>(`/dogs/${citizenId}/search`, { params: { q } })
      .then((r) => r.data);
  },
  register(citizenId: number, req: RegisterDogRequest): Promise<DogRegistration> {
    return http
      .post<DogRegistration>(`/dogs/${citizenId}`, req)
      .then((r) => r.data);
  },
};
