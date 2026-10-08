import React, { useEffect, useState, useCallback } from 'react';
import {
  Stack,
  Grid,
  Column,
  Form,
  FormGroup,
  TextInput,
  Button,
  InlineNotification,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Tile,
} from '@carbon/react';
import { Home, Send, Reset } from '@carbon/react/icons';
import { addressService } from '@/services/addressService';
import { useAuth } from '@/context/AuthContext';
import { StatusTag } from '@/components/common/StatusTag';
import { LoadingState } from '@/components/common/LoadingState';
import {
  validateRequired,
  validatePostcode,
  formatDate,
} from '@/utils/validation';
import type { Application, ApiError } from '@/types/api';

export default function AddressChangePage() {
  const { citizenId } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    street?: string;
    postcode?: string;
    city?: string;
  }>({});

  const loadApplications = useCallback(async () => {
    if (!citizenId) return;
    setLoading(true);
    setError(null);
    try {
      const apps = await addressService.getApplications(citizenId);
      setApplications(apps);
    } catch (e) {
      setError((e as ApiError).error ?? 'Fehler beim Laden der Adressänderungen.');
    } finally {
      setLoading(false);
    }
  }, [citizenId]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const handleReset = () => {
    setStreet('');
    setHouseNumber('');
    setPostcode('');
    setCity('');
    setFieldErrors({});
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenId) return;

    // Validate fields
    const streetErr = validateRequired(street, 'Straße');
    const postcodeErr = validatePostcode(postcode);
    const cityErr = validateRequired(city, 'Ort');

    if (streetErr || postcodeErr || cityErr) {
      setFieldErrors({
        street: streetErr ?? undefined,
        postcode: postcodeErr ?? undefined,
        city: cityErr ?? undefined,
      });
      setError('Bitte korrigieren Sie die markierten Pflichtfelder.');
      return;
    }

    setFieldErrors({});
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await addressService.submitChange(citizenId, {
        street: street.trim(),
        houseNumber: houseNumber.trim() || undefined,
        postcode: postcode.trim(),
        city: city.trim(),
      });

      const formattedNewAddress = `${street.trim()} ${houseNumber.trim()}, ${postcode.trim()} ${city.trim()}`.replace(/\s+,/, ',');
      setSuccess(`Adressänderung auf "${formattedNewAddress}" erfolgreich eingereicht.`);
      handleReset();
      const updatedApps = await addressService.getApplications(citizenId);
      setApplications(updatedApps);
    } catch (e) {
      setError((e as ApiError).error ?? 'Adressänderung konnte nicht übermittelt werden.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && applications.length === 0) {
    return <LoadingState description="Adressänderungs-Dienste werden geladen..." />;
  }

  const headers = [
    { key: 'id', header: 'Antrags-Nr.' },
    { key: 'createdDate', header: 'Datum' },
    { key: 'notes', header: 'Neue Adresse' },
    { key: 'status', header: 'Status' },
    { key: 'lastUpdated', header: 'Zuletzt geändert' },
  ];

  const rows = applications.map((a) => ({
    id: String(a.id),
    createdDate: formatDate(a.createdDate),
    notes: a.notes ?? '—',
    status: a.status,
    lastUpdated: formatDate(a.lastUpdated ?? a.createdDate),
  }));

  return (
    <Stack gap={7}>
      {/* Header */}
      <div>
        <h2 className="cds--productive-heading-05" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Home size={28} style={{ color: 'var(--cds-interactive)' }} />
          Adressänderung melden
        </h2>
        <p className="cds--body-01" style={{ color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
          Bitte geben Sie Ihre neue Adresse ein. Der Antrag wird nach Prüfung durch die Meldebehörde bearbeitet.
          Sie erhalten eine Bestätigung an Ihre neue Meldeadresse.
        </p>
      </div>

      {/* Legal Notice */}
      <InlineNotification
        kind="warning-alt"
        title="Rechtlicher Hinweis (§ 17 BMG):"
        subtitle="Gemäß § 17 Bundesmeldegesetz (BMG) sind Sie gesetzlich verpflichtet, sich innerhalb von zwei Wochen nach dem Einzug bei der Meldebehörde anzumelden. Eine verspätete Anmeldung kann mit einem Bußgeld von bis zu 1.000,00 € geahndet werden."
        lowContrast
        hideCloseButton
      />

      {/* Notifications */}
      {error && (
        <InlineNotification
          kind="error"
          title="Fehler:"
          subtitle={error}
          lowContrast
          onCloseButtonClick={() => setError(null)}
        />
      )}
      {success && (
        <InlineNotification
          kind="success"
          title="Erfolg:"
          subtitle={success}
          lowContrast
          onCloseButtonClick={() => setSuccess(null)}
        />
      )}

      {/* Main Grid: Form + Document Guide */}
      <Grid narrow style={{ rowGap: '2rem' }}>
        <Column sm={4} md={8} lg={8}>
          <Tile style={{ padding: '1.5rem' }}>
            <h3 className="cds--productive-heading-03" style={{ marginBottom: '1.25rem' }}>
              Neue Meldeadresse eingeben
            </h3>
            <Form onSubmit={handleSubmit}>
              <FormGroup legendText="">
                <Stack gap={5}>
                  <Grid narrow>
                    <Column sm={4} md={6} lg={10}>
                      <TextInput
                        id="street"
                        labelText="Straße *"
                        placeholder="z. B. Hauptstraße"
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                          if (fieldErrors.street) setFieldErrors((prev) => ({ ...prev, street: undefined }));
                        }}
                        invalid={!!fieldErrors.street}
                        invalidText={fieldErrors.street}
                        maxLength={200}
                        required
                      />
                    </Column>
                    <Column sm={4} md={2} lg={6}>
                      <TextInput
                        id="houseNumber"
                        labelText="Hausnummer"
                        placeholder="z. B. 42a"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        maxLength={20}
                      />
                    </Column>
                  </Grid>

                  <Grid narrow>
                    <Column sm={4} md={3} lg={6}>
                      <TextInput
                        id="postcode"
                        labelText="Postleitzahl *"
                        placeholder="80331"
                        helperText="Genau 5 Ziffern"
                        value={postcode}
                        onChange={(e) => {
                          setPostcode(e.target.value);
                          if (fieldErrors.postcode) setFieldErrors((prev) => ({ ...prev, postcode: undefined }));
                        }}
                        invalid={!!fieldErrors.postcode}
                        invalidText={fieldErrors.postcode}
                        maxLength={5}
                        required
                      />
                    </Column>
                    <Column sm={4} md={5} lg={10}>
                      <TextInput
                        id="city"
                        labelText="Ort / Stadt *"
                        placeholder="Musterstadt"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (fieldErrors.city) setFieldErrors((prev) => ({ ...prev, city: undefined }));
                        }}
                        invalid={!!fieldErrors.city}
                        invalidText={fieldErrors.city}
                        maxLength={100}
                        required
                      />
                    </Column>
                  </Grid>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <Button
                      type="submit"
                      disabled={submitting}
                      renderIcon={Send}
                    >
                      {submitting ? 'Änderung wird beantragt...' : 'Änderung beantragen'}
                    </Button>
                    <Button
                      kind="secondary"
                      type="button"
                      disabled={submitting}
                      renderIcon={Reset}
                      onClick={handleReset}
                    >
                      Zurücksetzen
                    </Button>
                  </div>
                </Stack>
              </FormGroup>
            </Form>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile style={{ padding: '1.5rem', background: 'var(--cds-layer-01)' }}>
            <h3 className="cds--productive-heading-03" style={{ marginBottom: '1rem' }}>
              Benötigte Unterlagen &amp; Nachweise
            </h3>
            <p className="cds--body-01" style={{ color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>
              Für die endgültige Bearbeitung Ihrer Adressänderung im Einwohnermeldeamt sind folgende Dokumente bereitzuhalten:
            </p>

            <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8, listStyleType: 'disc' }}>
              <li>
                <strong>Gültiges Ausweisdokument:</strong> Personalausweis oder Reisepass zur Aktualisierung des Wohnortaufklebers.
              </li>
              <li>
                <strong>Wohnungsgeberbestätigung:</strong> Gesetzlich vorgeschriebene Bescheinigung des Vermieters über Ihren Einzug.
              </li>
              <li>
                <strong>Bei Zuzug aus dem Ausland:</strong> Vollständige Abmeldebescheinigung sowie Geburts- oder Heiratsurkunde.
              </li>
              <li>
                <strong>Für Minderjährige:</strong> Zustimmung aller sorgeberechtigten Personen.
              </li>
            </ul>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--cds-border-subtle)',
                fontSize: '0.8125rem',
                color: 'var(--cds-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Einwohnermeldeamt Musterstadt:</p>
              <p style={{ margin: 0 }}>Rathausplatz 1 &bull; Zimmer 102 &bull; Tel. 089-12345-200</p>
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Applications Table */}
      <div>
        <TableContainer
          title="Meine Adressänderungs-Anträge"
          description="Statusübersicht aller gemeldeten Wohnsitzänderungen"
        >
          {rows.length === 0 ? (
            <Tile style={{ padding: '2rem', textAlign: 'center', color: 'var(--cds-text-secondary)' }}>
              Sie haben bisher noch keine Adressänderungsanträge eingereicht.
            </Tile>
          ) : (
            <DataTable rows={rows} headers={headers} isSortable>
              {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((h) => (
                        <TableHeader {...getHeaderProps({ header: h })} key={h.key}>
                          {h.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableRows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'status' ? (
                              <StatusTag status={cell.value} />
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          )}
        </TableContainer>
      </div>
    </Stack>
  );
}
