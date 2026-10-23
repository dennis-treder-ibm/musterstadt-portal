import { useEffect, useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ApplicationsTable } from '@/components/ApplicationsTable'
import { ErrorAlert, LoadingState, SuccessAlert } from '@/components/Feedback'
import { InfoBox } from '@/components/InfoBox'
import { SectionHeading } from '@/components/SectionHeading'
import { addressApi } from '@/services/addressApi'
import type { Application } from '@/types/domain'
import { getUserMessage } from '@/utils/errorMessages'
import { validateAll, validateCity, validatePostcode, validateStreet } from '@/utils/validation'

interface FormErrors {
  street?: string
  postcode?: string
  city?: string
}

export function AddressPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [postcode, setPostcode] = useState('')
  const [city, setCity] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  useEffect(() => {
    addressApi
      .getApplications()
      .then((apps) => setApplications(apps))
      .catch((err: unknown) => setError(getUserMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  function handleReset() {
    setStreet('')
    setHouseNumber('')
    setPostcode('')
    setCity('')
    setFormErrors({})
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const errors = validateAll(
      { street, postcode, city },
      { street: validateStreet, postcode: validatePostcode, city: validateCity },
    )
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      await addressApi.submitChange({
        street,
        houseNumber: houseNumber || undefined,
        postcode,
        city,
      })
      setSuccess(
        'Ihr Antrag auf Adressänderung wurde erfolgreich eingereicht. Sie erhalten eine Benachrichtigung per Post.',
      )
      handleReset()
      const updated = await addressApi.getApplications()
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
      <SectionHeading>Adressänderung beantragen</SectionHeading>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Bitte geben Sie Ihre neue Adresse ein. Der Antrag wird nach Prüfung bearbeitet.
        Sie erhalten eine Benachrichtigung per Post an Ihre bisherige Adresse.
      </Typography>

      {/* Legal notice */}
      <InfoBox severity="warning">
        <strong>Rechtlicher Hinweis:</strong> Gemäß § 17 Bundesmeldegesetz (BMG) sind Sie
        verpflichtet, sich innerhalb von zwei Wochen nach dem Einzug anzumelden. Eine verspätete
        Anmeldung kann mit einem Bußgeld von bis zu 1.000,00 € geahndet werden.
      </InfoBox>

      <SuccessAlert message={success} onClose={() => setSuccess(null)} />
      <ErrorAlert message={error} onClose={() => setError(null)} />

      {/* Address change form */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Neue Adresse eingeben
        </Typography>
        <Box
          component="form"
          onSubmit={(e: FormEvent) => void handleSubmit(e)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}
        >
          <TextField
            id="street"
            label="Straße"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            error={!!formErrors.street}
            helperText={formErrors.street}
            required
            fullWidth
          />

          <TextField
            id="houseNumber"
            label="Hausnummer"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 20 } }}
            fullWidth
          />

          <TextField
            id="postcode"
            label="Postleitzahl"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 10 } }}
            error={!!formErrors.postcode}
            helperText={formErrors.postcode}
            required
            fullWidth
          />

          <TextField
            id="city"
            label="Ort"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            error={!!formErrors.city}
            helperText={formErrors.city}
            required
            fullWidth
          />

          <Typography variant="caption" color="text.secondary">
            * Pflichtfelder
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Änderung beantragen
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Applications table */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Meine Adressänderungs-Anträge
      </Typography>
      <Box sx={{ mb: 4 }}>
        <ApplicationsTable
          applications={applications}
          extraColumns={[{ header: 'Neue Adresse', render: (app) => app.notes }]}
          emptyMessage="Noch keine Adressänderungs-Anträge vorhanden."
        />
      </Box>

      {/* Required documents info */}
      <InfoBox severity="info">
        <strong>Benötigte Unterlagen:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>Personalausweis oder Reisepass</li>
          <li>Wohnungsgeberbestätigung (Vermieterbescheinigung)</li>
          <li>Bei Umzug aus dem Ausland: zusätzliche Dokumente erforderlich</li>
        </ul>
      </InfoBox>
    </Box>
  )
}
