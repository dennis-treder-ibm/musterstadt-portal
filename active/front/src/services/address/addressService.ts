import type { Application } from '@/types/domain'
import type { AddressChangeRequest } from '@/types/dto'
import { BaseService } from '../http/BaseService'

/** Address change endpoints (`/api/address`). */
class AddressService extends BaseService {
  constructor() {
    super('/address')
  }

  submitChange(request: AddressChangeRequest): Promise<Application> {
    return this.post<Application, AddressChangeRequest>('/change', request)
  }

  listApplications(): Promise<Application[]> {
    return this.get<Application[]>('/applications')
  }
}

export const addressService = new AddressService()
