import type { DogRegistration } from '@/types/domain'
import type { DogRegistrationRequest, DogUpdateRequest } from '@/types/dto'
import { BaseService } from '../http/BaseService'

/** Dog registration endpoints (`/api/dogs`). */
class DogService extends BaseService {
  constructor() {
    super('/dogs')
  }

  register(request: DogRegistrationRequest): Promise<DogRegistration> {
    return this.post<DogRegistration, DogRegistrationRequest>('', request)
  }

  list(): Promise<DogRegistration[]> {
    return this.get<DogRegistration[]>('')
  }

  search(query: string): Promise<DogRegistration[]> {
    return this.get<DogRegistration[]>('/search', { params: { q: query } })
  }

  update(id: number, request: DogUpdateRequest): Promise<DogRegistration> {
    return this.put<DogRegistration, DogUpdateRequest>(`/${id}`, request)
  }
}

export const dogService = new DogService()
