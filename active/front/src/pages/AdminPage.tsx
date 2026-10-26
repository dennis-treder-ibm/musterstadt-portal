import { InfoNotice } from '@/components/common/InfoNotice'
import { PageHeader } from '@/components/common/PageHeader'

/** Placeholder of the legacy admin area (not implemented in the original application either). */
export function AdminPage() {
  return (
    <>
      <PageHeader title="Administrationsbereich" />
      <InfoNotice title="Demnächst verfügbar.">
        Dieser Bereich befindet sich in Entwicklung und steht zu einem späteren Zeitpunkt zur Verfügung.
      </InfoNotice>
    </>
  )
}
