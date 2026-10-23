import { api } from '@/services/http'
import type { Application, ApplicationStatus, ParkingApplicationRequest, ParkingPermit } from '@/types/domain'

export const parkingApi = {
  getZones: () => api.get<string[]>('/parking/zones'),
  getApplications: () => api.get<Application[]>('/parking/applications'),
  submitApplication: (request: ParkingApplicationRequest) =>
    api.post<Application>('/parking/applications', request),
  getPermit: (applicationId: number) =>
    api.get<ParkingPermit>(`/parking/applications/${applicationId}/permit`),
  updateStatus: (applicationId: number, status: ApplicationStatus) =>
    api.patch<Application>(`/parking/applications/${applicationId}/status`, undefined, {
      params: { status },
    }),
}
