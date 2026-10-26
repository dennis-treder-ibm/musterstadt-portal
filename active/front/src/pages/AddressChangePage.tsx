import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FeedbackSnackbar } from '@/components/common/FeedbackSnackbar'
import { FormActions } from '@/components/common/FormActions'
import { FormTextField } from '@/components/common/FormTextField'
import { InfoNotice } from '@/components/common/InfoNotice'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SortablePaginatedTable, type DataColumn } from '@/components/common/SortablePaginatedTable'
import { StatusChip } from '@/components/common/StatusChip'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useForm } from '@/hooks/useForm'
import { addressService } from '@/services'
import type { Application } from '@/types/domain'
import { formatDate } from '@/utils/format'
import { compose, maxLength, postcode, required } from '@/utils/validation'

const COLUMNS: ReadonlyArray<DataColumn<Application>> = [
  { id: 'id', header: 'Antrags-Nr.', render: (a) => a.id, sortValue: (a) => a.id },
  { id: 'notes', header: 'Neue Adresse', render: (a) => a.notes ?? '—', sortValue: (a) => a.notes ?? '' },
  { id: 'createdDate', header: 'Datum', render: (a) => formatDate(a.createdDate), sortValue: (a) => a.createdDate },
  { id: 'status', header: 'Status', render: (a) => <StatusChip status={a.status} />, sortValue: (a) => a.status },
]

const INITIAL = { street: '', houseNumber: '', postcode: '', city: '' }
const RULES = {
  street: compose(required('Straße darf nicht leer sein.'), maxLength(200)),
  houseNumber: maxLength(20),
  postcode: compose(postcode, (value: string) => (value.trim().length > 10 ? 'Postleitzahl ungültig' : undefined)),
  city: compose(required('Ort darf nicht leer sein.'), maxLength(100)),
}

const fetchApplications = () => addressService.listApplications()

export function AddressChangePage() {
  const applications = useApiQuery(fetchApplications)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm({
    initialValues: INITIAL,
    rules: RULES,
    onSubmit: async (values) => {
      const houseNumber = values.houseNumber.trim()
      const created = await addressService.submitChange({
        street: values.street.trim(),
        ...(houseNumber ? { houseNumber } : {}),
        postcode: values.postcode.trim(),
        city: values.city.trim(),
      })
      setSuccess(`Ihre Adressänderung wurde erfolgreich beantragt. Antragsnummer: ${created.id}`)
    },
    onSuccess: applications.reload,
  })

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Adressänderung beantragen"
        description="Bitte geben Sie Ihre neue Adresse ein. Der Antrag wird nach Prüfung bearbeitet. Sie erhalten eine Benachrichtigung per Post an Ihre bisherige Adresse."
      />

      <InfoNotice severity="warning" title="Rechtlicher Hinweis:">
        Gemäß § 17 Bundesmeldegesetz (BMG) sind Sie verpflichtet, sich innerhalb von zwei Wochen nach dem Einzug anzumelden. Eine verspätete
        Anmeldung kann mit einem Bußgeld von bis zu 1.000,00 € geahndet werden.
      </InfoNotice>

      <Paper component="form" onSubmit={form.handleSubmit} noValidate variant="outlined" sx={{ p: 3 }} aria-label="Adressänderung">
        <Stack spacing={2.5}>
          {form.submitError && <ErrorAlert message={form.submitError} />}
          <FormTextField label="Straße" required slotProps={{ htmlInput: { maxLength: 200 } }} {...form.getFieldProps('street')} />
          <FormTextField label="Hausnummer" slotProps={{ htmlInput: { maxLength: 20 } }} {...form.getFieldProps('houseNumber')} />
          <FormTextField
            label="Postleitzahl"
            required
            hint="5 Ziffern"
            slotProps={{ htmlInput: { maxLength: 10, inputMode: 'numeric' } }}
            {...form.getFieldProps('postcode')}
          />
          <FormTextField label="Ort" required slotProps={{ htmlInput: { maxLength: 100 } }} {...form.getFieldProps('city')} />
          <FormActions submitLabel="Änderung beantragen" submitting={form.submitting} />
        </Stack>
      </Paper>

      <section aria-labelledby="my-address-applications">
        <Typography id="my-address-applications" variant="h5" component="h2" gutterBottom>
          Meine Adressänderungs-Anträge
        </Typography>
        {applications.loading && <LoadingState label="Anträge werden geladen …" />}
        {applications.error && <ErrorAlert message={applications.error} onRetry={applications.reload} />}
        {applications.data && (
          <SortablePaginatedTable
            caption="Meine Adressänderungs-Anträge"
            columns={COLUMNS}
            rows={applications.data}
            getRowId={(a) => a.id}
            emptyMessage="Keine Anträge vorhanden."
            defaultSort={{ columnId: 'id', direction: 'desc' }}
          />
        )}
      </section>

      <section aria-labelledby="needed-documents">
        <Typography id="needed-documents" variant="h5" component="h2" gutterBottom>
          Benötigte Unterlagen
        </Typography>
        <ul>
          <li>Personalausweis oder Reisepass</li>
          <li>Wohnungsgeberbestätigung (Vermieterbescheinigung)</li>
          <li>Bei Umzug aus dem Ausland: zusätzliche Dokumente</li>
        </ul>
      </section>

      <FeedbackSnackbar message={success} onClose={() => setSuccess(null)} />
    </Stack>
  )
}
