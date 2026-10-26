import type { DashboardSummary } from '@/types/dto'
import { BaseService } from '../http/BaseService'

/** Dashboard endpoint (`/api/dashboard`). */
class DashboardService extends BaseService {
  constructor() {
    super('/dashboard')
  }

  getSummary(): Promise<DashboardSummary> {
    return this.get<DashboardSummary>('/summary')
  }
}

export const dashboardService = new DashboardService()
