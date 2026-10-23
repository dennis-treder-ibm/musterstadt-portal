import { api } from '@/services/http'
import type { Citizen } from '@/types/domain'
import type { CitizenRegistryResponse } from '@/types/domain'

export const citizenApi = {
  getById: (id: number) => api.get<Citizen>(`/citizens/${id}`),
  lookupRegistry: (lastName: string) =>
    api.get<CitizenRegistryResponse>('/citizens/registry', { params: { lastName } }),
}
