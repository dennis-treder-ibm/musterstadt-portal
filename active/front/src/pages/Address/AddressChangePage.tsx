import React, { useEffect, useState } from 'react';
import {
  Stack,
  Form,
  FormGroup,
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
import { addressService } from '@/services/addressService';
import { useAuth } from '@/context/AuthContext';
import type { Application, ApplicationStatus, ApiError } from '@/types/api';

const STATUS_KIND: Record<ApplicationStatus, 'blue' | 'green' | 'red'> = {
  PENDING: 'blue',
  APPROVED: 'green',
  REJECTED: 'red',
};

export default function AddressChangePage() {
  const { citizenId } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');

  const loadApplications = async () => {
    if (!citizenId) return;
    try {
      setApplications(await addressService.getApplications(citizenId));
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadApplications(); }, [citizenId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenId) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await addressService.submitChange(citizenId, { street, houseNumber: houseNumber || undefined, postcode, city });
      setSuccess('Adressänderung erfolgreich eingereicht.');
      setStreet(''); setHouseNumber(''); setPostcode(''); setCity('');
      setApplications(await addressService.getApplications(citizenId));
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setSubmitting(false);
    }
  };

  const headers = [
    { key: 'id', header: 'ID' },
    { key: 'notes', header: 'Adresse' },
    { key: 'status', header: 'Status' },
    { key: 'createdDate', header: 'Datum' },
  ];

  const rows = applications.map((a) => ({
    id: String(a.id),
    notes: a.notes ?? '—',
    status: a.status,
    createdDate: a.createdDate,
  }));

  if (loading) return <InlineLoading description="Laden..." />;

  return (
    <Stack gap={7}>
      <h2 className="cds--productive-heading-04">Adressänderung melden</h2>

      {error && <InlineNotification kind="error" title="Fehler:" subtitle={error} lowContrast onCloseButtonClick={() => setError(null)} />}
      {success && <InlineNotification kind="success" title="Erfolg:" subtitle={success} lowContrast onCloseButtonClick={() => setSuccess(null)} />}

      <Form onSubmit={handleSubmit}>
        <FormGroup legendText="Neue Adresse">
          <Stack gap={5}>
            <TextInput id="street" labelText="Straße *" value={street} onChange={(e) => setStreet(e.target.value)} required />
            <TextInput id="houseNumber" labelText="Hausnummer" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
            <TextInput
              id="postcode"
              labelText="Postleitzahl * (genau 5 Zeichen)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              maxLength={5}
              minLength={5}
              required
            />
            <TextInput id="city" labelText="Stadt *" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Einreichen…' : 'Adressänderung einreichen'}
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
