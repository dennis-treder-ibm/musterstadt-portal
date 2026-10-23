import { api } from '@/services/http'
import type { Application, AddressChangeRequest } from '@/types/domain'

export const addressApi = {
  submitChange: (request: AddressChangeRequest) =>
    api.post<Application>('/address/change', request),
  getApplications: () => api.get<Application[]>('/address/applications'),
}
