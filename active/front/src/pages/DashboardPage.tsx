import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { InfoNotice } from '@/components/common/InfoNotice'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { ServiceCard } from '@/components/common/ServiceCard'
import { SortablePaginatedTable, type DataColumn } from '@/components/common/SortablePaginatedTable'
import { StatCard } from '@/components/common/StatCard'
import { StatusChip } from '@/components/common/StatusChip'
import { useAuth } from '@/context/useAuth'
import { useApiQuery } from '@/hooks/useApiQuery'
import { paths } from '@/router/paths'
import { dashboardService } from '@/services'
import type { RecentActivity } from '@/types/dto'
import { formatDate, formatDateTime } from '@/utils/format'

const ACTIVITY_COLUMNS: ReadonlyArray<DataColumn<RecentActivity>> = [
  { id: 'createdDate', header: 'Datum', render: (a) => formatDate(a.createdDate), sortValue: (a) => a.createdDate },
  { id: 'type', header: 'Vorgang', render: (a) => a.typeDisplay, sortValue: (a) => a.typeDisplay },
  { id: 'status', header: 'Status', render: (a) => <StatusChip status={a.status} />, sortValue: (a) => a.statusDisplay },
  { id: 'lastUpdated', header: 'Zuletzt geändert', render: (a) => formatDateTime(a.lastUpdated), sortValue: (a) => a.lastUpdated ?? '' },
]

const QUICK_LINKS = [
  { title: 'Parkausweis beantragen', description: 'Antrag auf Parkausweis für Ihr Fahrzeug stellen.', to: paths.parkingPermit, actionLabel: 'Zum Antrag »' },
  { title: 'Adressänderung melden', description: 'Neue Adresse bei der Meldebehörde anzeigen.', to: paths.addressChange, actionLabel: 'Zur Adressänderung »' },
  { title: 'Hund anmelden', description: 'Ihren Hund bei der Stadt registrieren lassen.', to: paths.dogRegistration, actionLabel: 'Zur Hundeanmeldung »' },
] as const

const fetchSummary = () => dashboardService.getSummary()

/** Main dashboard: welcome, key figures, recent activity, quick links and Hochwasserhilfe notice. */
export function DashboardPage() {
  const { user } = useAuth()
  const { data: summary, loading, error, reload } = useApiQuery(fetchSummary)

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Willkommen im Bürgerportal Musterstadt"
        description={`Guten Tag! Sie sind angemeldet als ${user?.displayName ?? 'Benutzer'}. Hier finden Sie eine Übersicht Ihrer Anträge und Zugang zu allen Bürgerdiensten.`}
      />

      <section aria-labelledby="stats-heading">
        <Typography id="stats-heading" variant="h5" component="h2" gutterBottom>
          Übersicht: Aktuelle Zahlen
        </Typography>
        {loading && <LoadingState label="Übersicht wird geladen …" />}
        {error && <ErrorAlert message={error} onRetry={reload} />}
        {summary && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard label="Parkausweise" value={summary.parkingPermitCount} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard label="Hundeanmeldungen" value={summary.dogRegistrationCount} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard label="Offene Anträge" value={summary.openApplicationCount} color="warning.main" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard label="Genehmigte Anträge" value={summary.approvedCount} color="success.main" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard label="Abgelehnte Anträge" value={summary.rejectedCount} color="error.main" />
            </Grid>
          </Grid>
        )}
      </section>

      {summary && (
        <section aria-labelledby="activity-heading">
          <Typography id="activity-heading" variant="h5" component="h2" gutterBottom>
            Letzte Vorgänge
          </Typography>
          <SortablePaginatedTable
            caption="Letzte Vorgänge"
            columns={ACTIVITY_COLUMNS}
            rows={summary.recentActivity}
            getRowId={(a) => a.id}
            emptyMessage="Keine Vorgänge vorhanden."
            defaultRowsPerPage={10}
          />
        </section>
      )}

      <section aria-labelledby="quicklinks-heading">
        <Typography id="quicklinks-heading" variant="h5" component="h2" gutterBottom>
          Schnellzugriff
        </Typography>
        <Grid container spacing={2}>
          {QUICK_LINKS.map((link) => (
            <Grid key={link.to} size={{ xs: 12, md: 4 }}>
              <ServiceCard {...link} />
            </Grid>
          ))}
        </Grid>
      </section>

      <InfoNotice severity="info" title="Hinweis:">
        Der Bereich Hochwasserhilfe befindet sich derzeit in Entwicklung und steht demnächst zur Verfügung. Bei dringenden Anfragen wenden Sie
        sich bitte telefonisch an die Stadtverwaltung.
      </InfoNotice>
    </Stack>
  )
}
