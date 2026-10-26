import type { Citizen } from '@/types/domain'
import type { RegistryLookupResult } from '@/types/dto'
import { BaseService } from '../http/BaseService'

/** Citizen endpoints (`/api/citizens`). The registry lookup is a backend stub. */
class CitizenService extends BaseService {
  constructor() {
    super('/citizens')
  }

  getById(id: number): Promise<Citizen> {
    return this.get<Citizen>(`/${id}`)
  }

  lookupRegistry(lastName: string): Promise<RegistryLookupResult> {
    return this.get<RegistryLookupResult>('/registry', { params: { lastName } })
  }
}

export const citizenService = new CitizenService()
