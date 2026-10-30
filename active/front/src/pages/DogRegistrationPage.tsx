import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useId, useState, type FormEvent } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FeedbackSnackbar } from '@/components/common/FeedbackSnackbar'
import { FormActions } from '@/components/common/FormActions'
import { FormTextField } from '@/components/common/FormTextField'
import { InfoNotice } from '@/components/common/InfoNotice'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SortablePaginatedTable, type DataColumn } from '@/components/common/SortablePaginatedTable'
import { useAuth } from '@/context/useAuth'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useForm } from '@/hooks/useForm'
import { dogService } from '@/services'
import type { DogRegistration } from '@/types/domain'
import { formatDate } from '@/utils/format'
import { chipNumber, maxLength, required } from '@/utils/validation'

const REGISTER_INITIAL = { dogName: '', breed: '', chipNumber: '' }
const REGISTER_RULES = {
  dogName: (value: string) => required('Hundename darf nicht leer sein.')(value) ?? maxLength(100)(value),
  breed: maxLength(100),
  chipNumber,
}

const EDIT_RULES = {
  dogName: REGISTER_RULES.dogName,
  breed: REGISTER_RULES.breed,
}

const DOG_TAX_ROWS = [
  { label: 'Erster Hund', value: '60,00 € / Jahr' },
  { label: 'Zweiter Hund', value: '90,00 € / Jahr' },
  { label: 'Kampfhunde nach § 1 der Kampfhundeverordnung', value: '900,00 € / Jahr' },
  { label: 'Blindenhunde und Therapiehunde', value: 'befreit' },
] as const

const TAX_COLUMNS: ReadonlyArray<DataColumn<(typeof DOG_TAX_ROWS)[number]>> = [
  { id: 'label', header: 'Hund', render: (r) => r.label },
  { id: 'value', header: 'Steuer', render: (r) => r.value, align: 'right' },
]

interface EditDogDialogProps {
  dog: DogRegistration
  onClose: () => void
  onSaved: (dog: DogRegistration) => void
}

/** Modal form to change name and breed of a registered dog (`PUT /api/dogs/{id}`). */
function EditDogDialog({ dog, onClose, onSaved }: EditDogDialogProps) {
  const formId = useId()
  const titleId = useId()
  const form = useForm({
    initialValues: { dogName: dog.dogName, breed: dog.breed ?? '' },
    rules: EDIT_RULES,
    resetOnSuccess: false,
    onSubmit: async (values) => {
      const breed = values.breed.trim()
      const updated = await dogService.update(dog.id, {
        dogName: values.dogName.trim(),
        ...(breed ? { breed } : {}),
      })
      onSaved(updated)
    },
  })

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby={titleId}>
      <DialogTitle id={titleId}>Hund bearbeiten (Reg.-Nr. {dog.id})</DialogTitle>
      <DialogContent>
        <Stack component="form" id={formId} onSubmit={form.handleSubmit} noValidate spacing={2.5} sx={{ pt: 1 }}>
          {form.submitError && <ErrorAlert message={form.submitError} />}
          <FormTextField label="Hundename" required slotProps={{ htmlInput: { maxLength: 100 } }} {...form.getFieldProps('dogName')} />
          <FormTextField label="Rasse" slotProps={{ htmlInput: { maxLength: 100 } }} {...form.getFieldProps('breed')} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={form.submitting}>
          Abbrechen
        </Button>
        <Button type="submit" form={formId} variant="contained" disabled={form.submitting}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function DogRegistrationPage() {
  const { user } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<DogRegistration | null>(null)

  const dogs = useApiQuery(() => (query ? dogService.search(query) : dogService.list()), query)

  const form = useForm({
    initialValues: REGISTER_INITIAL,
    rules: REGISTER_RULES,
    onSubmit: async (values) => {
      const breed = values.breed.trim()
      const chip = values.chipNumber.trim()
      const created = await dogService.register({
        dogName: values.dogName.trim(),
        ...(breed ? { breed } : {}),
        ...(chip ? { chipNumber: chip } : {}),
      })
      setSuccess(`Hund erfolgreich angemeldet. Registrierungsnummer: ${created.id}`)
    },
    onSuccess: dogs.reload,
  })

  const columns: ReadonlyArray<DataColumn<DogRegistration>> = [
    { id: 'id', header: 'Reg.-Nr.', render: (d) => d.id, sortValue: (d) => d.id },
    { id: 'dogName', header: 'Hundename', render: (d) => d.dogName, sortValue: (d) => d.dogName },
    { id: 'breed', header: 'Rasse', render: (d) => d.breed ?? '—', sortValue: (d) => d.breed ?? '' },
    { id: 'registrationDate', header: 'Anmeldedatum', render: (d) => formatDate(d.registrationDate), sortValue: (d) => d.registrationDate },
    { id: 'chipNumber', header: 'Chip-Nummer', render: (d) => d.chipNumber ?? '—', sortValue: (d) => d.chipNumber ?? '' },
    {
      id: 'actions',
      header: 'Aktionen',
      align: 'right',
      render: (d) => (
        <IconButton size="small" aria-label={`Hund ${d.dogName} bearbeiten`} onClick={() => setEditing(d)}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery(searchInput.trim())
  }

  const handleSearchReset = () => {
    setSearchInput('')
    setQuery('')
  }

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Hundeanmeldung"
        description="Melden Sie Ihren Hund bei der Stadtverwaltung Musterstadt an. Die Hundesteuerpflicht entsteht mit dem Tag der Anmeldung. Bitte halten Sie den Chip-Nummern-Nachweis bereit."
      />

      <Paper component="form" onSubmit={form.handleSubmit} noValidate variant="outlined" sx={{ p: 3 }} aria-label="Hundeanmeldung">
        <Stack spacing={2.5}>
          {form.submitError && <ErrorAlert message={form.submitError} />}
          <FormTextField label="Hundename" required slotProps={{ htmlInput: { maxLength: 100 } }} {...form.getFieldProps('dogName')} />
          <FormTextField
            label="Rasse"
            hint="z.B. Schäferhund, Labrador, Dackel"
            slotProps={{ htmlInput: { maxLength: 100 } }}
            {...form.getFieldProps('breed')}
          />
          <TextField
            label="Besitzer"
            value={user?.displayName ?? ''}
            helperText="(angemeldeter Benutzer)"
            fullWidth
            slotProps={{ htmlInput: { readOnly: true } }}
          />
          <FormTextField
            label="Chip-Nummer"
            hint="15-stellig, ISO 11784"
            slotProps={{ htmlInput: { maxLength: 50, inputMode: 'numeric' } }}
            {...form.getFieldProps('chipNumber')}
          />
          <FormActions submitLabel="Hund anmelden" submitting={form.submitting} onReset={form.reset} />
        </Stack>
      </Paper>

      <section aria-labelledby="dog-search">
        <Typography id="dog-search" variant="h5" component="h2" gutterBottom>
          Registrierte Hunde suchen
        </Typography>
        <Stack component="form" onSubmit={handleSearch} direction={{ xs: 'column', sm: 'row' }} spacing={2} role="search">
          <TextField
            label="Suchbegriff"
            placeholder="Hundename oder Rasse..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            fullWidth
            size="small"
          />
          <Button type="submit" variant="contained">
            Suchen
          </Button>
          <Button type="button" variant="outlined" onClick={handleSearchReset}>
            Zurücksetzen
          </Button>
        </Stack>
      </section>

      <section aria-labelledby="my-dogs">
        <Typography id="my-dogs" variant="h5" component="h2" gutterBottom>
          Meine registrierten Hunde
        </Typography>
        {dogs.loading && <LoadingState label="Hunde werden geladen …" />}
        {dogs.error && <ErrorAlert message={dogs.error} onRetry={dogs.reload} />}
        {dogs.data && (
          <SortablePaginatedTable
            caption="Meine registrierten Hunde"
            columns={columns}
            rows={dogs.data}
            getRowId={(d) => d.id}
            emptyMessage="Keine Einträge gefunden."
            defaultSort={{ columnId: 'id', direction: 'desc' }}
          />
        )}
      </section>

      <section aria-labelledby="dog-tax">
        <Typography id="dog-tax" variant="h5" component="h2" gutterBottom>
          Hundesteuer-Information
        </Typography>
        <SortablePaginatedTable caption="Hundesteuer-Information" columns={TAX_COLUMNS} rows={DOG_TAX_ROWS} getRowId={(r) => r.label} />
      </section>

      <InfoNotice title="Hinweis:">
        Die Hundesteuer wird jährlich erhoben. Die Steuerpflicht beginnt mit dem Tag der Anmeldung.
      </InfoNotice>

      {editing && (
        <EditDogDialog
          key={editing.id}
          dog={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            setSuccess('Hund erfolgreich aktualisiert.')
            dogs.reload()
          }}
        />
      )}

      <FeedbackSnackbar message={success} onClose={() => setSuccess(null)} />
    </Stack>
  )
}
