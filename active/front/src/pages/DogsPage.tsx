import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import { ErrorAlert, LoadingState, SuccessAlert } from '@/components/Feedback'
import { InfoBox } from '@/components/InfoBox'
import { SectionHeading } from '@/components/SectionHeading'
import { useAuth } from '@/context/AuthContext'
import { dogApi } from '@/services/dogApi'
import type { DogRegistration } from '@/types/domain'
import { getUserMessage } from '@/utils/errorMessages'
import { formatDate } from '@/utils/format'
import { validateAll, validateDogName } from '@/utils/validation'

type SortField = 'dogName' | 'breed' | 'registrationDate'
type SortDir = 'asc' | 'desc'

interface FormErrors {
  dogName?: string
}

interface EditDialogProps {
  dog: DogRegistration | null
  open: boolean
  onClose: () => void
  onSaved: (updated: DogRegistration) => void
}

function EditDogDialog({ dog, open, onClose, onSaved }: EditDialogProps) {
  const [dogName, setDogName] = useState('')
  const [breed, setBreed] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync form state when the dialog opens for a different dog
  useEffect(() => {
    if (dog) {
      setDogName(dog.dogName)
      setBreed(dog.breed ?? '')
      setFormErrors({})
      setError(null)
    }
  }, [dog])

  async function handleSave() {
    if (!dog) return
    const errors = validateAll({ dogName }, { dogName: validateDogName })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    setError(null)
    try {
      const updated = await dogApi.update(dog.id, { dogName, breed: breed || undefined })
      onSaved(updated)
      onClose()
    } catch (err: unknown) {
      setError(getUserMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Hundedaten bearbeiten</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <ErrorAlert message={error} onClose={() => setError(null)} />
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Hundename"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            error={!!formErrors.dogName}
            helperText={formErrors.dogName}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Rasse"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            helperText="z. B. Schäferhund, Labrador, Dackel"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={submitting}>
          Abbrechen
        </Button>
        <Button
          onClick={() => void handleSave()}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function DogsPage() {
  const { session } = useAuth()
  const [dogs, setDogs] = useState<DogRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Registration form
  const [dogName, setDogName] = useState('')
  const [breed, setBreed] = useState('')
  const [chipNumber, setChipNumber] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Search & table
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('registrationDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Edit dialog
  const [editTarget, setEditTarget] = useState<DogRegistration | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  function loadDogs() {
    return dogApi
      .getMyDogs()
      .then((data) => setDogs(data))
      .catch((err: unknown) => setError(getUserMessage(err)))
  }

  useEffect(() => {
    setLoading(true)
    void loadDogs().finally(() => setLoading(false))
  }, [])

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const errors = validateAll({ dogName }, { dogName: validateDogName })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      await dogApi.register({
        dogName,
        breed: breed || undefined,
        chipNumber: chipNumber || undefined,
      })
      setSuccess(`${dogName} wurde erfolgreich angemeldet. Die Hundesteuerpflicht beginnt ab heute.`)
      setDogName('')
      setBreed('')
      setChipNumber('')
      await loadDogs()
    } catch (err: unknown) {
      setError(getUserMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    setSearching(true)
    setPage(0)
    try {
      const results = await dogApi.search(searchQuery)
      setDogs(results)
    } catch (err: unknown) {
      setError(getUserMessage(err))
    } finally {
      setSearching(false)
    }
  }

  async function handleClearSearch() {
    setSearchQuery('')
    setPage(0)
    await loadDogs()
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(0)
  }

  function handleEditOpen(dog: DogRegistration) {
    setEditTarget(dog)
    setEditOpen(true)
  }

  function handleEditClose() {
    setEditOpen(false)
  }

  function handleEditSaved(updated: DogRegistration) {
    setDogs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    setSuccess(`Daten für ${updated.dogName} wurden erfolgreich gespeichert.`)
  }

  const sortedDogs = useMemo(() => {
    return [...dogs].sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      const cmp = String(av).localeCompare(String(bv), 'de')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [dogs, sortField, sortDir])

  const paginatedDogs = sortedDogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (loading) return <LoadingState />

  return (
    <Box>
      <SectionHeading>Hundeanmeldung</SectionHeading>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Melden Sie Ihren Hund bei der Stadtverwaltung Musterstadt an. Die Hundesteuerpflicht
        entsteht mit dem Tag der Anmeldung. Bitte halten Sie den Chip-Nummern-Nachweis bereit.
      </Typography>

      <SuccessAlert message={success} onClose={() => setSuccess(null)} />
      <ErrorAlert message={error} onClose={() => setError(null)} />

      {/* Registration form */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Hund anmelden
        </Typography>
        <Box
          component="form"
          onSubmit={(e: FormEvent) => void handleRegister(e)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}
        >
          <TextField
            id="dogName"
            label="Hundename"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            error={!!formErrors.dogName}
            helperText={formErrors.dogName}
            required
            fullWidth
          />

          <TextField
            id="breed"
            label="Rasse"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            helperText="z. B. Schäferhund, Labrador, Dackel"
            fullWidth
          />

          <TextField
            id="owner"
            label="Besitzer"
            value={session?.username ?? ''}
            slotProps={{ input: { readOnly: true } }}
            helperText="Angemeldeter Benutzer"
            fullWidth
          />

          <TextField
            id="chipNumber"
            label="Chip-Nummer"
            value={chipNumber}
            onChange={(e) => setChipNumber(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 50 } }}
            helperText="15-stellig, ISO 11784"
            fullWidth
          />

          <Typography variant="caption" color="text.secondary">
            * Pflichtfelder
          </Typography>

          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Hund anmelden
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Search form */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Registrierte Hunde suchen
      </Typography>
      <Box
        component="form"
        onSubmit={(e: FormEvent) => void handleSearch(e)}
        sx={{ display: 'flex', gap: 1, mb: 2 }}
      >
        <TextField
          id="searchQuery"
          label="Suche"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Hundename oder Rasse…"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 280 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={searching}
          startIcon={searching ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Suchen
        </Button>
        <Button type="button" variant="outlined" color="inherit" onClick={() => void handleClearSearch()}>
          Zurücksetzen
        </Button>
      </Box>

      {/* Dogs table */}
      <Typography variant="h6" component="h3" sx={{ mb: 1.5 }}>
        Registrierte Hunde
      </Typography>
      {dogs.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Keine Einträge gefunden.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table size="small" aria-label="Registrierte Hunde">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                <TableCell>Reg.-Nr.</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'dogName'}
                    direction={sortField === 'dogName' ? sortDir : 'asc'}
                    onClick={() => handleSort('dogName')}
                  >
                    Hundename
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'breed'}
                    direction={sortField === 'breed' ? sortDir : 'asc'}
                    onClick={() => handleSort('breed')}
                  >
                    Rasse
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'registrationDate'}
                    direction={sortField === 'registrationDate' ? sortDir : 'asc'}
                    onClick={() => handleSort('registrationDate')}
                  >
                    Anmeldedatum
                  </TableSortLabel>
                </TableCell>
                <TableCell>Chip-Nummer</TableCell>
                <TableCell aria-label="Aktionen" />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDogs.map((dog) => (
                <TableRow key={dog.id} hover>
                  <TableCell>{dog.id}</TableCell>
                  <TableCell>{dog.dogName}</TableCell>
                  <TableCell>{dog.breed ?? '–'}</TableCell>
                  <TableCell>{formatDate(dog.registrationDate)}</TableCell>
                  <TableCell>{dog.chipNumber ?? '–'}</TableCell>
                  <TableCell sx={{ width: 48, py: 0 }}>
                    <Tooltip title="Bearbeiten">
                      <IconButton
                        size="small"
                        aria-label={`${dog.dogName} bearbeiten`}
                        onClick={() => handleEditOpen(dog)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={dogs.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(_, p) => setPage(p)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setPage(0)
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage="Einträge pro Seite:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} von ${count}`
                  }
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}

      {/* Tax info */}
      <InfoBox severity="info">
        <strong>Hundesteuer-Information:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>Erster Hund: 60,00 € / Jahr</li>
          <li>Zweiter Hund: 90,00 € / Jahr</li>
          <li>Kampfhunde nach § 1 der Kampfhundeverordnung: 900,00 € / Jahr</li>
          <li>Blindenhunde und Therapiehunde: befreit</li>
        </ul>
      </InfoBox>

      {/* Edit dialog */}
      <EditDogDialog
        dog={editTarget}
        open={editOpen}
        onClose={handleEditClose}
        onSaved={handleEditSaved}
      />
    </Box>
  )
}
