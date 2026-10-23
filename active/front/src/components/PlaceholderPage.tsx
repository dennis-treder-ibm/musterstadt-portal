import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import { PageHeader } from '@/components/PageHeader'

interface PlaceholderPageProps {
  title: string
  description: string
  /** Backend endpoints this page will use – documented for the components phase. */
  endpoints: readonly string[]
  children?: ReactNode
}

/** Minimal stand-in for pages that are implemented in the components phase. */
export function PlaceholderPage({ title, description, endpoints, children }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} subtitle={description} />
      <Alert severity="info">
        Diese Seite wird in der Komponenten-Phase umgesetzt. Vorgesehene Endpunkte: {endpoints.join(', ')}
      </Alert>
      {children}
    </>
  )
}
