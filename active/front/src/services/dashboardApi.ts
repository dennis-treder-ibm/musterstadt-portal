import { api } from '@/services/http'
import type { DashboardSummary } from '@/types/domain'

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
}
