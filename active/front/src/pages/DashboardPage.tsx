import { PlaceholderPage } from '@/components/PlaceholderPage'

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="Willkommen im Bürgerportal Musterstadt"
      description="Übersicht über Ihre Anträge und Anmeldungen."
      endpoints={['GET /api/dashboard/summary']}
    />
  )
}
