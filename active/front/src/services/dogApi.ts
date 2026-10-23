import { api } from '@/services/http'
import type { DogRegistration, DogRegistrationRequest, DogUpdateRequest } from '@/types/domain'

export const dogApi = {
  register: (request: DogRegistrationRequest) =>
    api.post<DogRegistration>('/dogs', request),
  getMyDogs: () => api.get<DogRegistration[]>('/dogs'),
  search: (query: string) =>
    api.get<DogRegistration[]>('/dogs/search', { params: { q: query } }),
  update: (id: number, request: DogUpdateRequest) =>
    api.put<DogRegistration>(`/dogs/${id}`, request),
}
