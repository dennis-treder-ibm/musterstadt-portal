import { useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import { ErrorAlert, LoadingState, SuccessAlert } from '@/components/Feedback'
import { InfoBox } from '@/components/InfoBox'
import { SectionHeading } from '@/components/SectionHeading'
import { useAuth } from '@/context/AuthContext'
import { citizenApi } from '@/services/citizenApi'
import type { Citizen, CitizenRegistryResponse } from '@/types/domain'
import { getUserMessage } from '@/utils/errorMessages'
import { formatAddress, formatDate } from '@/utils/format'

interface LabeledFieldProps {
  label: string
  value: string | null | undefined
  fallback?: string
}

function LabeledField({ label, value, fallback = '–' }: LabeledFieldProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {value || fallback}
      </Typography>
    </Box>
  )
}

export function CitizenPage() {
  const { session } = useAuth()

  // Citizen profile state
  const [citizen, setCitizen] = useState<Citizen | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Registry lookup state
  const [lastName, setLastName] = useState('')
  const [registryLoading, setRegistryLoading] = useState(false)
  const [registryResult, setRegistryResult] = useState<CitizenRegistryResponse | null>(null)
  const [registryError, setRegistryError] = useState<string | null>(null)
  const [registrySuccess, setRegistrySuccess] = useState<string | null>(null)

  async function handleLoadProfile() {
    if (!session?.citizenId) return
    setProfileLoading(true)
    setProfileError(null)
    try {
      const data = await citizenApi.getById(session.citizenId)
      setCitizen(data)
      setProfileLoaded(true)
    } catch (err: unknown) {
      setProfileError(getUserMessage(err))
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleRegistryLookup(e: FormEvent) {
    e.preventDefault()
    if (!lastName.trim()) return
    setRegistryLoading(true)
    setRegistryResult(null)
    setRegistryError(null)
    setRegistrySuccess(null)
    try {
      const result = await citizenApi.lookupRegistry(lastName.trim())
      setRegistryResult(result)
      if (result.found) {
        setRegistrySuccess(`Eintrag gefunden für: ${result.fullName ?? lastName}`)
      } else {
        setRegistryError(`Kein Eintrag für "${lastName}" im Bürgerregister gefunden.`)
      }
    } catch (err: unknown) {
      setRegistryError(getUserMessage(err))
    } finally {
      setRegistryLoading(false)
    }
  }

  return (
    <Box>
      <SectionHeading>Mein Bürgerprofil</SectionHeading>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hier finden Sie Ihre hinterlegten Stammdaten sowie die Möglichkeit, das Bürgerregister
        abzufragen.
      </Typography>

      {/* Profile section */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Stammdaten
      </Typography>

      {!profileLoaded && !profileLoading && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
            <PersonIcon />
            <Typography variant="body2">
              Angemeldet als: <strong>{session?.username}</strong>
            </Typography>
          </Box>
          {profileError && <ErrorAlert message={profileError} onClose={() => setProfileError(null)} />}
          <Button variant="contained" onClick={() => void handleLoadProfile()}>
            Profildaten laden
          </Button>
        </Paper>
      )}

      {profileLoading && <LoadingState message="Profil wird geladen…" />}

      {profileLoaded && citizen && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'primary.main' }}>
            <PersonIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {citizen.fullName}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledField label="Vorname" value={citizen.firstName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledField label="Nachname" value={citizen.lastName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledField
                label="Adresse"
                value={formatAddress({
                  street: citizen.street,
                  houseNumber: citizen.houseNumber,
                  postcode: citizen.postcode,
                  city: citizen.city,
                })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledField label="E-Mail" value={citizen.email} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledField label="Telefon" value={citizen.phone} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledField
                label="Registriert seit"
                value={citizen.registeredDate ? formatDate(citizen.registeredDate) : null}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Registry lookup section */}
      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        Bürgerregister-Abfrage
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Suchen Sie nach einem Bürger im zentralen Einwohnermelderegister. Bitte geben Sie den
        Nachnamen ein.
      </Typography>

      <InfoBox severity="warning">
        <strong>Hinweis:</strong> Diese Abfrage nutzt die Legacy-Schnittstelle des städtischen
        Bürgerregisters. Aufgrund der Systemarchitektur kann die Anfrage einige Sekunden dauern.
      </InfoBox>

      <Paper variant="outlined" sx={{ p: 3, mb: 4, mt: 2 }}>
        <Box
          component="form"
          onSubmit={(e: FormEvent) => void handleRegistryLookup(e)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}
        >
          <TextField
            id="lastName"
            label="Nachname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="z. B. Müller, Schmidt, Schneider"
            slotProps={{ htmlInput: { maxLength: 100 } }}
            required
            fullWidth
          />
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={registryLoading || !lastName.trim()}
              startIcon={
                registryLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SearchIcon />
                )
              }
            >
              Register abfragen
            </Button>
          </Box>
        </Box>

        {registrySuccess && (
          <Box sx={{ mt: 2 }}>
            <SuccessAlert message={registrySuccess} onClose={() => setRegistrySuccess(null)} />
          </Box>
        )}
        {registryError && (
          <Box sx={{ mt: 2 }}>
            <ErrorAlert message={registryError} onClose={() => setRegistryError(null)} />
          </Box>
        )}

        {registryResult?.found && (
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Treffer im Bürgerregister
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LabeledField label="Vollständiger Name" value={registryResult.fullName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LabeledField label="Registrierungs-ID" value={registryResult.citizenId} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <LabeledField label="Gemeldete Adresse" value={registryResult.verifiedAddress} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* Privacy notice */}
      <InfoBox severity="info">
        <strong>Datenschutzhinweis:</strong> Die Abfrage des Bürgerregisters ist nur für
        berechtigte Nutzer möglich und wird protokolliert. Es gelten die Datenschutzbestimmungen
        der Stadtverwaltung Musterstadt (§ 19 Abs. 1 DSGVO).
      </InfoBox>
    </Box>
  )
}
