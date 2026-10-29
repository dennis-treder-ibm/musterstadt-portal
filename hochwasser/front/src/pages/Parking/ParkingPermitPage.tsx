import React, { useEffect, useState, useCallback } from 'react';
import {
  Stack,
  Grid,
  Column,
  Form,
  FormGroup,
  Select,
  SelectItem,
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
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import { Car, Send, Reset } from '@carbon/react/icons';
import { parkingService } from '@/services/parkingService';
import { useAuth } from '@/context/AuthContext';
import { StatusTag } from '@/components/common/StatusTag';
import { LoadingState } from '@/components/common/LoadingState';
import {
  validateVehicleRegistration,
  normalizeVehicleRegistration,
  validateZone,
  formatDate,
} from '@/utils/validation';
import type { ParkingApplication, ApiError } from '@/types/api';

const ZONE_PRICING = [
  { zone: 'Zone A', area: 'Wohngebiete Nord', fee: '30,00 €', note: '24h gültig' },
  { zone: 'Zone B', area: 'Wohngebiete Süd', fee: '30,00 €', note: '24h gültig' },
  { zone: 'Zone C', area: 'Gewerbegebiet', fee: '45,00 €', note: 'Werktags 07–19 Uhr' },
  { zone: 'Innenstadt', area: 'Innenstadtkern', fee: '120,00 €', note: 'Begrenzte Anzahl verfügbar' },
];

export default function ParkingPermitPage() {
  const { citizenId } = useAuth();
  const [zones, setZones] = useState<string[]>([]);
  const [applications, setApplications] = useState<ParkingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [zone, setZone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [docPath, setDocPath] = useState('');

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{ zone?: string; vehicleReg?: string }>({});

  const loadData = useCallback(async () => {
    if (!citizenId) return;
    setLoading(true);
    setError(null);
    try {
      const [z, apps] = await Promise.all([
        parkingService.getZones(),
        parkingService.getApplications(citizenId),
      ]);
      setZones(z);
      setApplications(apps);
    } catch (e) {
      setError((e as ApiError).error ?? 'Fehler beim Laden der Parkausweis-Daten.');
    } finally {
      setLoading(false);
    }
  }, [citizenId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleReset = () => {
    setZone('');
    setVehicleReg('');
    setDocPath('');
    setFieldErrors({});
    setError(null);
  };

  const handleVehicleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setVehicleReg(raw.toUpperCase());
    if (fieldErrors.vehicleReg) {
      setFieldErrors((prev) => ({ ...prev, vehicleReg: undefined }));
    }
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setZone(e.target.value);
    if (fieldErrors.zone) {
      setFieldErrors((prev) => ({ ...prev, zone: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenId) return;

    // Validate fields
    const regError = validateVehicleRegistration(vehicleReg);
    const zoneError = validateZone(zone);

    if (regError || zoneError) {
      setFieldErrors({
        vehicleReg: regError ?? undefined,
        zone: zoneError ?? undefined,
      });
      setError('Bitte korrigieren Sie die markierten Eingabefelder.');
      return;
    }

    setFieldErrors({});
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await parkingService.createApplication(citizenId, {
        vehicleRegistration: normalizeVehicleRegistration(vehicleReg),
        zone,
        proofDocumentPath: docPath.trim() || undefined,
      });

      setSuccess(`Antrag für Kennzeichen "${normalizeVehicleRegistration(vehicleReg)}" in ${zone} erfolgreich eingereicht.`);
      handleReset();
      const updatedApps = await parkingService.getApplications(citizenId);
      setApplications(updatedApps);
    } catch (e) {
      setError((e as ApiError).error ?? 'Antrag konnte nicht übermittelt werden.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && applications.length === 0) {
    return <LoadingState description="Parkausweis-Dienste werden geladen..." />;
  }

  const headers = [
    { key: 'id', header: 'Antrags-Nr.' },
    { key: 'createdDate', header: 'Datum' },
    { key: 'vehicleRegistration', header: 'Kennzeichen' },
    { key: 'zone', header: 'Parkzone' },
    { key: 'status', header: 'Status' },
    { key: 'lastUpdated', header: 'Zuletzt geändert' },
  ];

  const rows = applications.map((a) => ({
    id: String(a.id),
    createdDate: formatDate(a.createdDate),
    vehicleRegistration: a.vehicleRegistration ?? '—',
    zone: a.zone ?? '—',
    status: a.status,
    lastUpdated: formatDate(a.lastUpdated ?? a.createdDate),
  }));

  return (
    <Stack gap={7}>
      {/* Header */}
      <div>
        <h2 className="cds--productive-heading-05" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Car size={28} style={{ color: 'var(--cds-interactive)' }} />
          Parkausweis beantragen
        </h2>
        <p className="cds--body-01" style={{ color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
          Mit diesem Formular können Sie einen Parkausweis für Ihr Kraftfahrzeug beantragen.
          Bitte füllen Sie alle Pflichtfelder aus und reichen Sie ggf. den Nachweis ein.
        </p>
      </div>

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

      {/* Main Grid: Form + Zone Guide */}
      <Grid narrow style={{ rowGap: '2rem' }}>
        <Column sm={4} md={8} lg={8}>
          <Tile style={{ padding: '1.5rem' }}>
            <h3 className="cds--productive-heading-03" style={{ marginBottom: '1.25rem' }}>
              Antragsformular: Parkausweis
            </h3>
            <Form onSubmit={handleSubmit}>
              <FormGroup legendText="">
                <Stack gap={5}>
                  <TextInput
                    id="vehicleRegistration"
                    labelText="Fahrzeugkennzeichen *"
                    helperText="Mindestens 5 Zeichen (z. B. M-AB 1234)"
                    placeholder="M-AB 1234"
                    value={vehicleReg}
                    onChange={handleVehicleRegChange}
                    invalid={!!fieldErrors.vehicleReg}
                    invalidText={fieldErrors.vehicleReg}
                    maxLength={20}
                    required
                  />

                  <Select
                    id="zone"
                    labelText="Parkzone *"
                    helperText="Wählen Sie die gewünschte Tarifzone"
                    value={zone}
                    onChange={handleZoneChange}
                    invalid={!!fieldErrors.zone}
                    invalidText={fieldErrors.zone}
                    required
                  >
                    <SelectItem value="" text="— Bitte Zone wählen —" />
                    {zones.map((z) => (
                      <SelectItem key={z} value={z} text={z} />
                    ))}
                  </Select>

                  <TextInput
                    id="proofDocumentPath"
                    labelText="Nachweisdokument (Dateipfad, optional)"
                    helperText="z. B. /uploads/fahrzeugschein.pdf (Nachweis von Wohnsitz oder Halterschaft)"
                    placeholder="/uploads/nachweis.pdf"
                    value={docPath}
                    onChange={(e) => setDocPath(e.target.value)}
                    maxLength={500}
                  />

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <Button
                      type="submit"
                      disabled={submitting}
                      renderIcon={Send}
                    >
                      {submitting ? 'Antrag wird eingereicht...' : 'Antrag einreichen'}
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
              Parkzonen-Übersicht &amp; Tarife
            </h3>
            <StructuredListWrapper isCondensed>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Zone</StructuredListCell>
                  <StructuredListCell head>Bereich</StructuredListCell>
                  <StructuredListCell head>Gebühr / Jahr</StructuredListCell>
                  <StructuredListCell head>Gültigkeit</StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {ZONE_PRICING.map((item) => (
                  <StructuredListRow key={item.zone}>
                    <StructuredListCell><strong>{item.zone}</strong></StructuredListCell>
                    <StructuredListCell>{item.area}</StructuredListCell>
                    <StructuredListCell>{item.fee}</StructuredListCell>
                    <StructuredListCell style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8125rem' }}>
                      {item.note}
                    </StructuredListCell>
                  </StructuredListRow>
                ))}
              </StructuredListBody>
            </StructuredListWrapper>

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
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Hinweise zur Bearbeitung:</p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, listStyleType: 'disc' }}>
                <li>Bearbeitungszeit: in der Regel innerhalb von 5 Werktagen.</li>
                <li>Gültigkeit: ab Genehmigungsdatum für 12 Monate.</li>
                <li>Rückwirkende Genehmigungen sind rechtlich nicht möglich.</li>
                <li>Bei Rückfragen: Zulassungsstelle Musterstadt (Tel. 089-12345-100).</li>
              </ul>
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Applications Table */}
      <div>
        <TableContainer
          title="Meine Parkausweis-Anträge"
          description="Statusübersicht aller eingereichten Parkausweisanträge"
        >
          {rows.length === 0 ? (
            <Tile style={{ padding: '2rem', textAlign: 'center', color: 'var(--cds-text-secondary)' }}>
              Sie haben bisher noch keine Parkausweisanträge eingereicht.
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

        {/* Status Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
          <span>Legende:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <StatusTag status="PENDING" size="sm" /> Ausstehend
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <StatusTag status="APPROVED" size="sm" /> Genehmigt
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <StatusTag status="REJECTED" size="sm" /> Abgelehnt
          </span>
        </div>
      </div>
    </Stack>
  );
}
