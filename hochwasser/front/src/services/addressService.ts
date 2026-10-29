import http from './http';
import type { Application, AddressChangeRequest } from '@/types/api';

export const addressService = {
  getApplications(citizenId: number): Promise<Application[]> {
    return http
      .get<Application[]>(`/address/${citizenId}/applications`)
      .then((r) => r.data);
  },
  submitChange(citizenId: number, req: AddressChangeRequest): Promise<Application> {
    return http
      .post<Application>(`/address/${citizenId}/applications`, req)
      .then((r) => r.data);
  },
};
