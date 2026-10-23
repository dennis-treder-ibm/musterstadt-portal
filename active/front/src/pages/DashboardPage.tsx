import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import HomeIcon from '@mui/icons-material/Home'
import PetsIcon from '@mui/icons-material/Pets'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { InfoBox } from '@/components/InfoBox'
import { LoadingState } from '@/components/Feedback'
import { SectionHeading } from '@/components/SectionHeading'
import { StatusChip } from '@/components/StatusChip'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/routes/paths'
import { dashboardApi } from '@/services/dashboardApi'
import type { DashboardSummary } from '@/types/domain'
import { getUserMessage } from '@/utils/errorMessages'
import { formatDate } from '@/utils/format'

interface StatCardProps {
  label: string
  value: number
  color?: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="p"
          sx={{ fontWeight: 700, color: color ?? 'primary.main' }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  )
}

interface QuickLinkCardProps {
  icon: React.ReactNode
  title: string
  description: string
  to: string
  linkLabel: string
}

function QuickLinkCard({ icon, title, description, to, linkLabel }: QuickLinkCardProps) {
  const navigate = useNavigate()
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
          {icon}
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }} color="primary">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {description}
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => navigate(to)}
          aria-label={`Zu ${title} wechseln`}
          sx={{ alignSelf: 'flex-start', px: 0 }}
        >
          {linkLabel} »
        </Button>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { session } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    dashboardApi
      .getSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getUserMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <LoadingState />

  return (
    <Box>
      <SectionHeading>Willkommen im Bürgerportal Musterstadt</SectionHeading>

      {/* Welcome banner */}
      <InfoBox severity="info">
        Guten Tag! Sie sind angemeldet als <strong>{session?.username}</strong>.{' '}
        Hier finden Sie eine Übersicht über die verfügbaren Online-Dienste der Stadt Musterstadt.
      </InfoBox>

      {error && (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics cards */}
      {summary && (
        <>
          <Typography variant="h6" component="h3" sx={{ mb: 1.5, mt: 3 }}>
            Übersicht: Aktuelle Zahlen
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <StatCard label="Parkausweise" value={summary.parkingPermitCount} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <StatCard label="Hundeanmeldungen" value={summary.dogRegistrationCount} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <StatCard label="Offene Anträge" value={summary.openApplicationCount} color="#cc6600" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <StatCard label="Genehmigte Anträge" value={summary.approvedCount} color="#006600" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <StatCard label="Abgelehnte Anträge" value={summary.rejectedCount} color="#cc0000" />
            </Grid>
          </Grid>

          {/* Recent activity */}
          <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
            Letzte Vorgänge
          </Typography>
          {summary.recentActivity.length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Noch keine Vorgänge vorhanden.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
              <Table size="small" aria-label="Letzte Vorgänge">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                    <TableCell>Datum</TableCell>
                    <TableCell>Vorgang</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Zuletzt geändert</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.recentActivity.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{formatDate(item.createdDate)}</TableCell>
                      <TableCell>{item.typeDisplay}</TableCell>
                      <TableCell>
                        <StatusChip status={item.status} statusDisplay={item.statusDisplay} />
                      </TableCell>
                      <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Quick links */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Schnellzugriff
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <QuickLinkCard
            icon={<DirectionsCarIcon />}
            title="Parkausweis beantragen"
            description="Antrag auf Parkausweis für Ihr Fahrzeug stellen."
            to={ROUTES.parking}
            linkLabel="Zum Antrag"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <QuickLinkCard
            icon={<HomeIcon />}
            title="Adressänderung melden"
            description="Neue Adresse bei der Meldebehörde anzeigen."
            to={ROUTES.address}
            linkLabel="Zur Adressänderung"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <QuickLinkCard
            icon={<PetsIcon />}
            title="Hund anmelden"
            description="Ihren Hund bei der Stadt registrieren lassen."
            to={ROUTES.dogs}
            linkLabel="Zur Hundeanmeldung"
          />
        </Grid>
      </Grid>

      {/* Coming soon notice */}
      <InfoBox severity="warning">
        <strong>Hinweis:</strong> Der Bereich <strong>Hochwasserhilfe</strong> befindet sich
        derzeit in Entwicklung und steht demnächst zur Verfügung. Bei dringenden Anfragen wenden
        Sie sich bitte telefonisch an die Stadtverwaltung.
      </InfoBox>
    </Box>
  )
}
