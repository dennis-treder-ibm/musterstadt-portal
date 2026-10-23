import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import { PageHeader } from '@/components/PageHeader'
import { ROUTES } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Seite nicht gefunden" subtitle="Die angeforderte Seite existiert nicht." />
      <Button component={RouterLink} to={ROUTES.root} variant="contained">
        Zur Startseite
      </Button>
    </>
  )
}
