import type { Application, ParkingPermit } from '@/types/domain'
import type { ParkingApplicationRequest } from '@/types/dto'
import { BaseService } from '../http/BaseService'

/** Parking permit endpoints (`/api/parking`). */
class ParkingService extends BaseService {
  constructor() {
    super('/parking')
  }

  submitApplication(request: ParkingApplicationRequest): Promise<Application> {
    return this.post<Application, ParkingApplicationRequest>('/applications', request)
  }

  listApplications(): Promise<Application[]> {
    return this.get<Application[]>('/applications')
  }

  getPermit(applicationId: number): Promise<ParkingPermit> {
    return this.get<ParkingPermit>(`/applications/${applicationId}/permit`)
  }

  updateStatus(applicationId: number, status: string): Promise<Application> {
    return this.patch<Application>(`/applications/${applicationId}/status`, undefined, { params: { status } })
  }

  listZones(): Promise<string[]> {
    return this.get<string[]>('/zones')
  }
}

export const parkingService = new ParkingService()
