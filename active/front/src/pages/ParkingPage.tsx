import { useEffect, useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import BadgeIcon from '@mui/icons-material/Badge'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ErrorAlert, LoadingState, SuccessAlert } from '@/components/Feedback'
import { InfoBox } from '@/components/InfoBox'
import { SectionHeading } from '@/components/SectionHeading'
import { StatusChip } from '@/components/StatusChip'
import { parkingApi } from '@/services/parkingApi'
import type { Application, ApplicationStatus, ParkingPermit } from '@/types/domain'
import { getUserMessage } from '@/utils/errorMessages'
import { formatDate } from '@/utils/format'
import { validateAll, validateVehicleRegistration, validateZone } from '@/utils/validation'

interface FormErrors {
  vehicleRegistration?: string
  zone?: string
}

const ZONE_INFO = [
  { zone: 'Zone A', bereich: 'Wohngebiete Nord', gebuehr: '30,00 €', hinweis: '24h gültig' },
  { zone: 'Zone B', bereich: 'Wohngebiete Süd', gebuehr: '30,00 €', hinweis: '24h gültig' },
  { zone: 'Zone C', bereich: 'Gewerbegebiet', gebuehr: '45,00 €', hinweis: 'Werktags 07–19 Uhr' },
  { zone: 'Innenstadt', bereich: 'Innenstadtkern', gebuehr: '120,00 €', hinweis: 'Begrenzte Anzahl verfügbar' },
]

// ----- Permit Detail Dialog --------------------------------------------------

interface PermitDetailDialogProps {
  applicationId: number | null
  open: boolean
  onClose: () => void
}

function PermitDetailDialog({ applicationId, open, onClose }: PermitDetailDialogProps) {
  const [permit, setPermit] = useState<ParkingPermit | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && applicationId !== null) {
      setLoading(true)
      setPermit(null)
      setError(null)
      parkingApi
        .getPermit(applicationId)
        .then((p) => setPermit(p))
        .catch((err: unknown) => setError(getUserMessage(err)))
        .finally(() => setLoading(false))
    }
  }, [open, applicationId])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Parkausweis-Details</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {permit && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Parkausweis-Nr.</Typography>
              <Typography variant="body2">{permit.id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Fahrzeugkennzeichen</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{permit.vehicleRegistration}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Parkzone</Typography>
              <Typography variant="body2">{permit.zone ?? '–'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Nachweisdokument</Typography>
              <Typography variant="body2">{permit.proofDocumentPath ?? '–'}</Typography>
            </Box>
          </Box>
        )}
        {!loading && !error && !permit && (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Kein Parkausweis für diesen Antrag gefunden.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ----- Enhanced Applications Table with actions -----------------------------

interface EnhancedApplicationsTableProps {
  applications: Application[]
  onStatusUpdate: (app: Application) => void
  onViewPermit: (applicationId: number) => void
  updatingId: number | null
  emptyMessage?: string
}

function EnhancedApplicationsTable({
  applications,
  onStatusUpdate,
  onViewPermit,
  updatingId,
  emptyMessage = 'Keine Anträge vorhanden.',
}: EnhancedApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Parkausweis-Anträge">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700 } }}>
            <TableCell>Antrags-Nr.</TableCell>
            <TableCell>Datum</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Zuletzt geändert</TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} hover>
              <TableCell>{app.id}</TableCell>
              <TableCell>{formatDate(app.createdDate)}</TableCell>
              <TableCell>
                <StatusChip status={app.status} statusDisplay={app.statusDisplay} />
              </TableCell>
              <TableCell>{formatDate(app.lastUpdated)}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {app.status === 'APPROVED' && (
                    <Tooltip title="Parkausweis anzeigen">
                      <IconButton
                        size="small"
                        aria-label={`Parkausweis für Antrag ${app.id} anzeigen`}
                        onClick={() => onViewPermit(app.id)}
                      >
                        <BadgeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {updatingId === app.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Tooltip title="Status ändern">
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onStatusUpdate(app)}
                        sx={{ minWidth: 0, fontSize: '0.75rem', py: 0 }}
                      >
                        Status
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// ----- Status Update Dialog -------------------------------------------------

interface StatusUpdateDialogProps {
  application: Application | null
  open: boolean
  onClose: () => void
  onConfirm: (app: Application, newStatus: ApplicationStatus) => void
  updating: boolean
}

function StatusUpdateDialog({ application, open, onClose, onConfirm, updating }: StatusUpdateDialogProps) {
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('')

  useEffect(() => {
    if (application) setNewStatus(application.status)
  }, [application])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Status ändern — Antrag #{application?.id}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Aktueller Status: <strong>{application?.statusDisplay}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="new-status-label">Neuer Status</InputLabel>
            <Select
              labelId="new-status-label"
              value={newStatus}
              label="Neuer Status"
              onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
            >
              <MenuItem value="PENDING">Ausstehend</MenuItem>
              <MenuItem value="APPROVED">Genehmigt</MenuItem>
              <MenuItem value="REJECTED">Abgelehnt</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={updating}>
          Abbrechen
        </Button>
        <Button
          variant="contained"
          disabled={updating || !newStatus || newStatus === application?.status}
          onClick={() => application && newStatus && onConfirm(application, newStatus as ApplicationStatus)}
          startIcon={updating ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ----- Main page ------------------------------------------------------------

export function ParkingPage() {
  const [zones, setZones] = useState<string[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [vehicleRegistration, setVehicleRegistration] = useState('')
  const [zone, setZone] = useState('')
  const [proofDocumentPath, setProofDocumentPath] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Zone info toggle
  const [zoneInfoOpen, setZoneInfoOpen] = useState(false)

  // Status update dialog
  const [statusTarget, setStatusTarget] = useState<Application | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Permit detail dialog
  const [permitApplicationId, setPermitApplicationId] = useState<number | null>(null)
  const [permitDialogOpen, setPermitDialogOpen] = useState(false)

  function loadData() {
    setLoading(true)
    Promise.all([parkingApi.getZones(), parkingApi.getApplications()])
      .then(([z, apps]) => {
        setZones(z)
        setApplications(apps)
      })
      .catch((err: unknown) => setError(getUserMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleReset() {
    setVehicleRegistration('')
    setZone('')
    setProofDocumentPath('')
    setFormErrors({})
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const errors = validateAll(
      { vehicleRegistration, zone },
      { vehicleRegistration: validateVehicleRegistration, zone: validateZone },
    )
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      await parkingApi.submitApplication({
        vehicleRegistration: vehicleRegistration.toUpperCase(),
        zone,
        proofDocumentPath: proofDocumentPath || undefined,
      })
      setSuccess(
        `Ihr Antrag für Fahrzeugkennzeichen ${vehicleRegistration.toUpperCase()} wurde erfolgreich eingereicht.`,
      )
      handleReset()
      const updated = await parkingApi.getApplications()
      setApplications(updated)
    } catch (err: unknown) {
      setError(getUserMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenStatusDialog(app: Application) {
    setStatusTarget(app)
    setStatusDialogOpen(true)
  }

  async function handleStatusConfirm(app: Application, newStatus: ApplicationStatus) {
    setStatusDialogOpen(false)
    setUpdatingId(app.id)
    try {
      const updated = await parkingApi.updateStatus(app.id, newStatus)
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setSuccess(`Status für Antrag ${app.id} wurde auf „${updated.statusDisplay}" geändert.`)
    } catch (err: unknown) {
      setError(getUserMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  function handleViewPermit(applicationId: number) {
    setPermitApplicationId(applicationId)
    setPermitDialogOpen(true)
  }

  if (loading) return <LoadingState />

  return (
    <Box>
      <SectionHeading>Parkausweis beantragen</SectionHeading>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mit diesem Formular können Sie einen Parkausweis für Ihr Fahrzeug beantragen.
        Bitte füllen Sie alle Pflichtfelder aus und reichen Sie den Nachweis ein.
      </Typography>

      <SuccessAlert message={success} onClose={() => setSuccess(null)} />
      <ErrorAlert message={error} onClose={() => setError(null)} />

      {/* Application form */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Antragsformular: Parkausweis
        </Typography>
        <Box
          component="form"
          onSubmit={(e: FormEvent) => void handleSubmit(e)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}
        >
          <TextField
            id="vehicleRegistration"
            label="Fahrzeugkennzeichen"
            value={vehicleRegistration}
            onChange={(e) => setVehicleRegistration(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 20, style: { textTransform: 'uppercase' } } }}
            helperText={formErrors.vehicleRegistration ?? 'Mind. 5 Zeichen'}
            error={!!formErrors.vehicleRegistration}
            required
            fullWidth
            autoComplete="off"
          />

          <FormControl fullWidth required error={!!formErrors.zone}>
            <InputLabel id="zone-label">Parkzone</InputLabel>
            <Select
              labelId="zone-label"
              id="zone"
              value={zone}
              label="Parkzone"
              onChange={(e) => setZone(e.target.value)}
            >
              <MenuItem value="">
                <em>— Bitte wählen —</em>
              </MenuItem>
              {zones.map((z) => (
                <MenuItem key={z} value={z}>
                  {z}
                </MenuItem>
              ))}
            </Select>
            {formErrors.zone && <FormHelperText>{formErrors.zone}</FormHelperText>}
          </FormControl>

          <TextField
            id="proofDocumentPath"
            label="Nachweisdokument (Pfad)"
            value={proofDocumentPath}
            onChange={(e) => setProofDocumentPath(e.target.value)}
            placeholder="/uploads/nachweis.pdf"
            helperText="Dateipfad des Nachweisdokuments (optional). Kein Upload – nur Pfadeingabe."
            slotProps={{ htmlInput: { maxLength: 500 } }}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Antrag einreichen
            </Button>
            <Button type="button" variant="outlined" color="inherit" onClick={handleReset}>
              Zurücksetzen
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Applications table with actions */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Meine Parkausweis-Anträge
      </Typography>
      <Box sx={{ mb: 4 }}>
        <EnhancedApplicationsTable
          applications={applications}
          onStatusUpdate={handleOpenStatusDialog}
          onViewPermit={handleViewPermit}
          updatingId={updatingId}
          emptyMessage="Noch keine Parkausweis-Anträge vorhanden."
        />
      </Box>

      {/* Zone overview (collapsible) */}
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" component="h3">
          Parkzonen-Übersicht
        </Typography>
        <IconButton
          size="small"
          onClick={() => setZoneInfoOpen((o) => !o)}
          aria-label={zoneInfoOpen ? 'Zoneninfo schließen' : 'Zoneninfo öffnen'}
          aria-expanded={zoneInfoOpen}
        >
          {zoneInfoOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={zoneInfoOpen}>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table size="small" aria-label="Parkzonen-Übersicht">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                <TableCell>Zone</TableCell>
                <TableCell>Bereich</TableCell>
                <TableCell>Gebühr / Jahr</TableCell>
                <TableCell>Bemerkung</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ZONE_INFO.map((row) => (
                <TableRow key={row.zone} hover>
                  <TableCell>{row.zone}</TableCell>
                  <TableCell>{row.bereich}</TableCell>
                  <TableCell>{row.gebuehr}</TableCell>
                  <TableCell>{row.hinweis}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
      {!zoneInfoOpen && (
        <Button
          size="small"
          variant="text"
          onClick={() => setZoneInfoOpen(true)}
          sx={{ mb: 3, px: 0 }}
        >
          Zonenübersicht anzeigen
        </Button>
      )}

      {/* Help text */}
      <InfoBox severity="info">
        <strong>Hinweise zur Antragstellung:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>Der Antrag wird innerhalb von 5 Werktagen bearbeitet.</li>
          <li>Bei Fragen wenden Sie sich an die Zulassungsstelle (Tel. 089-12345-100).</li>
          <li>Der Parkausweis gilt ab dem Datum der Genehmigung für 12 Monate.</li>
          <li>Eine rückwirkende Genehmigung ist nicht möglich.</li>
        </ul>
      </InfoBox>

      {/* Dialogs */}
      <StatusUpdateDialog
        application={statusTarget}
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onConfirm={(app, status) => void handleStatusConfirm(app, status)}
        updating={updatingId !== null}
      />
      <PermitDetailDialog
        applicationId={permitApplicationId}
        open={permitDialogOpen}
        onClose={() => setPermitDialogOpen(false)}
      />
    </Box>
  )
}
