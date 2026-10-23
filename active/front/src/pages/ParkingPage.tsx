import { PlaceholderPage } from '@/components/PlaceholderPage'

export function ParkingPage() {
  return (
    <PlaceholderPage
      title="Parkausweis"
      description="Beantragen Sie einen Parkausweis für Ihr Fahrzeug."
      endpoints={['GET /api/parking/zones', 'GET|POST /api/parking/applications']}
    />
  )
}
