import { PlaceholderPage } from '@/components/PlaceholderPage'

export function DogsPage() {
  return (
    <PlaceholderPage
      title="Hundeanmeldung"
      description="Registrieren Sie Ihren Hund und durchsuchen Sie Ihre Anmeldungen."
      endpoints={['GET|POST /api/dogs', 'GET /api/dogs/search', 'PUT /api/dogs/{id}']}
    />
  )
}
