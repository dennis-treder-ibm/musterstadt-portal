import { useEffect, useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
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
import Typography from '@mui/material/Typography'
import { ApplicationsTable } from '@/components/ApplicationsTable'
import { ErrorAlert, LoadingState, SuccessAlert } from '@/components/Feedback'
import { InfoBox } from '@/components/InfoBox'
import { SectionHeading } from '@/components/SectionHeading'
import { parkingApi } from '@/services/parkingApi'
import type { Application } from '@/types/domain'
import { getUserMessage } from '@/utils/errorMessages'
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
      // Refresh applications list
      const updated = await parkingApi.getApplications()
      setApplications(updated)
    } catch (err: unknown) {
      setError(getUserMessage(err))
    } finally {
      setSubmitting(false)
    }
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

      {/* Applications table */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Meine Parkausweis-Anträge
      </Typography>
      <Box sx={{ mb: 4 }}>
        <ApplicationsTable
          applications={applications}
          emptyMessage="Noch keine Parkausweis-Anträge vorhanden."
        />
      </Box>

      {/* Zone overview */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Parkzonen-Übersicht
      </Typography>
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
    </Box>
  )
}
