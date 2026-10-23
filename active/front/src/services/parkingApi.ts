import { api } from '@/services/http'
import type { Application, ParkingApplicationRequest } from '@/types/domain'

export const parkingApi = {
  getZones: () => api.get<string[]>('/parking/zones'),
  getApplications: () => api.get<Application[]>('/parking/applications'),
  submitApplication: (request: ParkingApplicationRequest) =>
    api.post<Application>('/parking/applications', request),
}
