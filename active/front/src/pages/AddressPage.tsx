import { PlaceholderPage } from '@/components/PlaceholderPage'

export function AddressPage() {
  return (
    <PlaceholderPage
      title="Adressänderung"
      description="Melden Sie Ihre neue Wohnanschrift an."
      endpoints={['POST /api/address/change', 'GET /api/address/applications']}
    />
  )
}
