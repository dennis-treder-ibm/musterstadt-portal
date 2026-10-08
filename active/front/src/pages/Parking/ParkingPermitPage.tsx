import React, { useEffect, useState } from 'react';
import {
  Stack,
  Form,
  FormGroup,
  Select,
  SelectItem,
  TextInput,
  Button,
  InlineLoading,
  InlineNotification,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
} from '@carbon/react';
import { parkingService } from '@/services/parkingService';
import { useAuth } from '@/context/AuthContext';
import type { ParkingApplication, ApplicationStatus, ApiError } from '@/types/api';

const STATUS_KIND: Record<ApplicationStatus, 'blue' | 'green' | 'red'> = {
  PENDING: 'blue',
  APPROVED: 'green',
  REJECTED: 'red',
};

export default function ParkingPermitPage() {
  const { citizenId } = useAuth();
  const [zones, setZones] = useState<string[]>([]);
  const [applications, setApplications] = useState<ParkingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [zone, setZone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [docPath, setDocPath] = useState('');

  const loadData = async () => {
    if (!citizenId) return;
    try {
      const [z, apps] = await Promise.all([
        parkingService.getZones(),
        parkingService.getApplications(citizenId),
      ]);
      setZones(z);
      setApplications(apps);
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, [citizenId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenId) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await parkingService.createApplication(citizenId, { vehicleRegistration: vehicleReg, zone, proofDocumentPath: docPath || undefined });
      setSuccess('Antrag erfolgreich eingereicht.');
      setVehicleReg('');
      setZone('');
      setDocPath('');
      const apps = await parkingService.getApplications(citizenId);
      setApplications(apps);
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setSubmitting(false);
    }
  };

  const headers = [
    { key: 'id', header: 'ID' },
    { key: 'zone', header: 'Zone' },
    { key: 'vehicleRegistration', header: 'Kennzeichen' },
    { key: 'status', header: 'Status' },
    { key: 'createdDate', header: 'Datum' },
  ];

  const rows = applications.map((a) => ({
    id: String(a.id),
    zone: a.zone ?? '—',
    vehicleRegistration: a.vehicleRegistration ?? '—',
    status: a.status,
    createdDate: a.createdDate,
  }));

  if (loading) return <InlineLoading description="Laden..." />;

  return (
    <Stack gap={7}>
      <h2 className="cds--productive-heading-04">Parkausweis beantragen</h2>

      {error && <InlineNotification kind="error" title="Fehler:" subtitle={error} lowContrast onCloseButtonClick={() => setError(null)} />}
      {success && <InlineNotification kind="success" title="Erfolg:" subtitle={success} lowContrast onCloseButtonClick={() => setSuccess(null)} />}

      <Form onSubmit={handleSubmit}>
        <FormGroup legendText="Neuer Antrag">
          <Stack gap={5}>
            <Select
              id="zone"
              labelText="Parkzone *"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              required
            >
              <SelectItem value="" text="Zone auswählen…" />
              {zones.map((z) => <SelectItem key={z} value={z} text={z} />)}
            </Select>
            <TextInput
              id="vehicleReg"
              labelText="Fahrzeugkennzeichen * (mind. 5 Zeichen)"
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value)}
              minLength={5}
              required
            />
            <TextInput
              id="docPath"
              labelText="Dokumentenpfad (optional)"
              value={docPath}
              onChange={(e) => setDocPath(e.target.value)}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Einreichen…' : 'Antrag einreichen'}
            </Button>
          </Stack>
        </FormGroup>
      </Form>

      <div>
        <h3 className="cds--productive-heading-03" style={{ marginBottom: '1rem' }}>Meine Anträge</h3>
        <DataTable rows={rows} headers={headers}>
          {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {tableHeaders.map((h) => <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.info.header === 'status'
                          ? <Tag type={STATUS_KIND[cell.value as ApplicationStatus]}>{cell.value}</Tag>
                          : cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
      </div>
    </Stack>
  );
}
