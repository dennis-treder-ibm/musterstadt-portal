import React, { useEffect, useState } from 'react';
import {
  Stack,
  Form,
  FormGroup,
  TextInput,
  Search,
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
} from '@carbon/react';
import { dogService } from '@/services/dogService';
import { useAuth } from '@/context/AuthContext';
import type { DogRegistration, ApiError } from '@/types/api';

export default function DogRegistrationPage() {
  const { citizenId } = useAuth();
  const [registrations, setRegistrations] = useState<DogRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [chipNumber, setChipNumber] = useState('');

  const loadRegistrations = async () => {
    if (!citizenId) return;
    try {
      setRegistrations(await dogService.getRegistrations(citizenId));
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRegistrations(); }, [citizenId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    if (!citizenId) return;
    setLoading(true);
    try {
      setRegistrations(await dogService.search(citizenId, searchTerm));
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    if (!citizenId) return;
    setLoading(true);
    try {
      setRegistrations(await dogService.getRegistrations(citizenId));
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenId) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await dogService.register(citizenId, { dogName, breed: breed || undefined, chipNumber: chipNumber || undefined });
      setSuccess('Hund erfolgreich registriert.');
      setDogName(''); setBreed(''); setChipNumber('');
      setRegistrations(await dogService.getRegistrations(citizenId));
    } catch (e) {
      setError((e as ApiError).error);
    } finally {
      setSubmitting(false);
    }
  };

  const headers = [
    { key: 'id', header: 'ID' },
    { key: 'dogName', header: 'Name' },
    { key: 'breed', header: 'Rasse' },
    { key: 'chipNumber', header: 'Chipnummer' },
    { key: 'registrationDate', header: 'Registriert' },
  ];

  const rows = registrations.map((r) => ({
    id: String(r.id),
    dogName: r.dogName,
    breed: r.breed ?? '—',
    chipNumber: r.chipNumber ?? '—',
    registrationDate: r.registrationDate,
  }));

  if (loading && registrations.length === 0) return <InlineLoading description="Laden..." />;

  return (
    <Stack gap={7}>
      <h2 className="cds--productive-heading-04">Hunderegistrierung</h2>

      {error && <InlineNotification kind="error" title="Fehler:" subtitle={error} lowContrast onCloseButtonClick={() => setError(null)} />}
      {success && <InlineNotification kind="success" title="Erfolg:" subtitle={success} lowContrast onCloseButtonClick={() => setSuccess(null)} />}

      <Form onSubmit={handleSubmit}>
        <FormGroup legendText="Neuen Hund registrieren">
          <Stack gap={5}>
            <TextInput id="dogName" labelText="Hundename *" value={dogName} onChange={(e) => setDogName(e.target.value)} required />
            <TextInput id="breed" labelText="Rasse (optional)" value={breed} onChange={(e) => setBreed(e.target.value)} />
            <TextInput id="chipNumber" labelText="Chipnummer (optional)" value={chipNumber} onChange={(e) => setChipNumber(e.target.value)} />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Registrieren…' : 'Hund registrieren'}
            </Button>
          </Stack>
        </FormGroup>
      </Form>

      <div>
        <h3 className="cds--productive-heading-03" style={{ marginBottom: '1rem' }}>Meine Hunde</h3>
        <Stack gap={4}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <Search
              id="dog-search"
              labelText="Suche nach Name oder Rasse"
              placeholder="Suche…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={handleClearSearch}
            />
            <Button kind="secondary" onClick={handleSearch}>Suchen</Button>
          </div>
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
                      {row.cells.map((cell) => <TableCell key={cell.id}>{cell.value}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </Stack>
      </div>
    </Stack>
  );
}
