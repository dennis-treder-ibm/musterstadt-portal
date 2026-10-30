import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FeedbackSnackbar } from '@/components/common/FeedbackSnackbar'
import { FormActions } from '@/components/common/FormActions'
import { FormSelect } from '@/components/common/FormSelect'
import { FormTextField } from '@/components/common/FormTextField'
import { InfoNotice } from '@/components/common/InfoNotice'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SortablePaginatedTable, type DataColumn } from '@/components/common/SortablePaginatedTable'
import { StatusChip } from '@/components/common/StatusChip'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useForm } from '@/hooks/useForm'
import { parkingService } from '@/services'
import type { Application } from '@/types/domain'
import { formatDate, formatDateTime, normalizeVehicleRegistration } from '@/utils/format'
import { maxLength, required, vehicleRegistration } from '@/utils/validation'

const COLUMNS: ReadonlyArray<DataColumn<Application>> = [
  { id: 'id', header: 'Antrags-Nr.', render: (a) => a.id, sortValue: (a) => a.id },
  { id: 'createdDate', header: 'Datum', render: (a) => formatDate(a.createdDate), sortValue: (a) => a.createdDate },
  { id: 'status', header: 'Status', render: (a) => <StatusChip status={a.status} />, sortValue: (a) => a.status },
  { id: 'lastUpdated', header: 'Zuletzt geändert', render: (a) => formatDateTime(a.lastUpdated), sortValue: (a) => a.lastUpdated ?? '' },
  { id: 'notes', header: 'Notizen', render: (a) => a.notes ?? '—' },
]

/** Static zone overview from the legacy page (fees are informational only). */
const ZONE_OVERVIEW = [
  { zone: 'Zone A', area: 'Wohngebiete Nord', fee: '30,00 €', remark: '24h gültig' },
  { zone: 'Zone B', area: 'Wohngebiete Süd', fee: '30,00 €', remark: '24h gültig' },
  { zone: 'Zone C', area: 'Gewerbegebiet', fee: '45,00 €', remark: 'Werktags 07–19 Uhr' },
  { zone: 'Innenstadt', area: 'Innenstadtkern', fee: '120,00 €', remark: 'Begrenzte Anzahl verfügbar' },
] as const

const ZONE_COLUMNS: ReadonlyArray<DataColumn<(typeof ZONE_OVERVIEW)[number]>> = [
  { id: 'zone', header: 'Zone', render: (z) => z.zone },
  { id: 'area', header: 'Bereich', render: (z) => z.area },
  { id: 'fee', header: 'Gebühr/Jahr', render: (z) => z.fee, align: 'right' },
  { id: 'remark', header: 'Bemerkung', render: (z) => z.remark },
]

const INITIAL = { vehicleRegistration: '', zone: '', proofDocumentPath: '' }
const RULES = {
  // Legacy message wording (ParkingPermitBean); also enforces the 20 character column limit.
  vehicleRegistration: (value: string) =>
    vehicleRegistration(value) === undefined
      ? maxLength(20)(value)
      : 'Fahrzeugkennzeichen muss mindestens 5 Zeichen lang sein.',
  zone: required('Bitte wählen Sie eine Parkzone aus.'),
  proofDocumentPath: maxLength(500),
}

const fetchApplications = () => parkingService.listApplications()
const fetchZones = () => parkingService.listZones()

export function ParkingPermitPage() {
  const applications = useApiQuery(fetchApplications)
  const zones = useApiQuery(fetchZones)
  const [success, setSuccess] = useState<string | null>(null)

  const zoneOptions = useMemo(() => (zones.data ?? []).map((z) => ({ value: z, label: z })), [zones.data])

  const form = useForm({
    initialValues: INITIAL,
    rules: RULES,
    onSubmit: async (values) => {
      const proof = values.proofDocumentPath.trim()
      const created = await parkingService.submitApplication({
        vehicleRegistration: normalizeVehicleRegistration(values.vehicleRegistration),
        zone: values.zone,
        ...(proof ? { proofDocumentPath: proof } : {}),
      })
      setSuccess(`Ihr Parkausweis-Antrag wurde erfolgreich eingereicht. Antragsnummer: ${created.id}`)
    },
    onSuccess: applications.reload,
  })

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Parkausweis beantragen"
        description="Mit diesem Formular können Sie einen Parkausweis für Ihr Fahrzeug beantragen. Bitte füllen Sie alle Pflichtfelder aus und reichen Sie den Nachweis ein."
      />

      <Paper component="form" onSubmit={form.handleSubmit} noValidate variant="outlined" sx={{ p: 3 }} aria-label="Parkausweis-Antrag">
        <Stack spacing={2.5}>
          {form.submitError && <ErrorAlert message={form.submitError} />}
          <FormTextField
            label="Fahrzeugkennzeichen"
            required
            hint="mind. 5 Zeichen"
            slotProps={{ htmlInput: { maxLength: 20, style: { textTransform: 'uppercase' } } }}
            {...form.getFieldProps('vehicleRegistration')}
          />
          <FormSelect
            label="Parkzone"
            required
            options={zoneOptions}
            disabled={zones.loading}
            hint={zones.error ?? undefined}
            {...form.getFieldProps('zone')}
          />
          <FormTextField
            label="Nachweisdokument (Pfad)"
            placeholder="/uploads/nachweis.pdf"
            hint="Kein Upload — nur Pfadeingabe"
            slotProps={{ htmlInput: { maxLength: 500 } }}
            {...form.getFieldProps('proofDocumentPath')}
          />
          <FormActions submitLabel="Antrag einreichen" submitting={form.submitting} onReset={form.reset} />
        </Stack>
      </Paper>

      <section aria-labelledby="my-applications">
        <Typography id="my-applications" variant="h5" component="h2" gutterBottom>
          Meine Parkausweis-Anträge
        </Typography>
        {applications.loading && <LoadingState label="Anträge werden geladen …" />}
        {applications.error && <ErrorAlert message={applications.error} onRetry={applications.reload} />}
        {applications.data && (
          <SortablePaginatedTable
            caption="Meine Parkausweis-Anträge"
            columns={COLUMNS}
            rows={applications.data}
            getRowId={(a) => a.id}
            emptyMessage="Keine Anträge vorhanden."
            defaultSort={{ columnId: 'id', direction: 'desc' }}
          />
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Status: Ausstehend = in Bearbeitung · Genehmigt = Parkausweis erteilt · Abgelehnt = Antrag nicht bewilligt.
        </Typography>
      </section>

      <section aria-labelledby="zone-overview">
        <Typography id="zone-overview" variant="h5" component="h2" gutterBottom>
          Parkzonen-Übersicht
        </Typography>
        <SortablePaginatedTable caption="Parkzonen-Übersicht" columns={ZONE_COLUMNS} rows={ZONE_OVERVIEW} getRowId={(z) => z.zone} />
      </section>

      <InfoNotice title="Hinweise:">
        Die Bearbeitung dauert in der Regel 5 Werktage. Bei Fragen erreichen Sie die Zulassungsstelle unter Tel. 089-12345-100. Der Parkausweis
        ist 12 Monate ab Genehmigung gültig. Eine rückwirkende Genehmigung ist nicht möglich.
      </InfoNotice>

      <FeedbackSnackbar message={success} onClose={() => setSuccess(null)} />
    </Stack>
  )
}
