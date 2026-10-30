import React, { useEffect, useState, useCallback } from 'react';
import {
  Stack,
  Grid,
  Column,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Select,
  SelectItem,
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
  Pagination,
  Tile,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import { Warning, Send, Reset } from '@carbon/react/icons';
import { floodService } from '@/services/floodService';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/common/LoadingState';
import { validatePostcode, formatDate } from '@/utils/validation';
import type { FloodApplication, FloodSeverityLevel, ApiError } from '@/types/api';

const SEVERITY_OPTIONS: { value: FloodSeverityLevel; label: string }[] = [
  { value: 'LEICHT', label: 'Leicht' },
  { value: 'MITTEL', label: 'Mittel' },
  { value: 'SCHWER', label: 'Schwer' },
];

const AID_INFO = [
  { category: 'Soforthilfe (Erste Maßnahmen)', amount: 'bis 5.000 €', note: 'Unbürokratische Erstversorgung' },
  { category: 'Schadensbehebung Wohngebäude', amount: 'bis 50.000 €', note: 'Antragspflichtig, Nachweis erforderlich' },
  { category: 'Gewerbliche Schäden', amount: 'bis 100.000 €', note: 'Gesonderte Bearbeitung durch Wirtschaftsamt' },
  { category: 'Infrastruktur & Keller', amount: 'Individuell', note: 'Begutachtung vor Ort notwendig' },
];

export default function FloodAssistancePage() {
  const { citizenId, citizenName } = useAuth();
  const [applications, setApplications] = useState<FloodApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [damageDescription, setDamageDescription] = useState('');
  const [affectedStreet, setAffectedStreet] = useState('');
  const [postcode, setPostcode] = useState('');
  const [severityLevel, setSeverityLevel] = useState<FloodSeverityLevel | ''>('');

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<{
    damageDescription?: string;
    affectedStreet?: string;
    postcode?: string;
    severityLevel?: string;
  }>({});

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadApplications = useCallback(async () => {
    if (!citizenId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await floodService.getApplications(citizenId);
      setApplications(data);
    } catch (e) {
      setError((e as ApiError).error ?? 'Fehler beim Laden der Hochwasserhilfe-Anträge.');
    } finally {
      setLoading(false);
    }
  }, [citizenId]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const handleReset = () => {
    setDamageDescription('');
    setAffectedStreet('');
    setPostcode('');
    setSeverityLevel('');
    setFieldErrors({});
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenId) return;

    // Validate fields
    const errors: typeof fieldErrors = {};
    if (!damageDescription.trim()) {
      errors.damageDescription = 'Schadensbeschreibung ist ein Pflichtfeld.';
    } else if (damageDescription.trim().length > 500) {
      errors.damageDescription = 'Schadensbeschreibung darf maximal 500 Zeichen lang sein.';
    }
    if (!affectedStreet.trim()) {
      errors.affectedStreet = 'Betroffene Straße ist ein Pflichtfeld.';
    }
    const postcodeErr = validatePostcode(postcode);
    if (postcodeErr) errors.postcode = postcodeErr;
    if (!severityLevel) {
      errors.severityLevel = 'Bitte wählen Sie einen Schweregrad aus.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Bitte korrigieren Sie die markierten Eingabefelder.');
      return;
    }

    setFieldErrors({});
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await floodService.createApplication(citizenId, {
        damageDescription: damageDescription.trim(),
        affectedStreet: affectedStreet.trim(),
        postcode: postcode.trim(),
        severityLevel: severityLevel as FloodSeverityLevel,
      });

      setSuccess('Ihr Hochwasserhilfe-Antrag wurde erfolgreich eingereicht. Sie erhalten eine Bestätigung per Post.');
      handleReset();
      const updated = await floodService.getApplications(citizenId);
      setApplications(updated);
    } catch (e) {
      setError((e as ApiError).error ?? 'Antrag konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && applications.length === 0) {
    return <LoadingState description="Hochwasserhilfe-Dienste werden geladen..." />;
  }

  const headers = [
    { key: 'id', header: 'Antrags-Nr.' },
    { key: 'affectedStreet', header: 'Betroffene Straße' },
    { key: 'severityLevel', header: 'Schweregrad' },
    { key: 'createdDate', header: 'Eingereicht am' },
    { key: 'statusDisplay', header: 'Status' },
  ];

  const allRows = applications.map((a) => ({
    id: String(a.id),
    affectedStreet: a.affectedStreet ?? '—',
    severityLevel: a.severityLevel ?? '—',
    createdDate: formatDate(a.createdDate),
    statusDisplay: a.statusDisplay ?? a.status,
  }));

  const startIndex = (page - 1) * pageSize;
  const paginatedRows = allRows.slice(startIndex, startIndex + pageSize);

  return (
    <Stack gap={7}>
      {/* Header */}
      <div>
        <h2
          className="cds--productive-heading-05"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Warning size={28} style={{ color: 'var(--cds-support-warning)' }} />
          Hochwasserhilfe
        </h2>
        <p
          className="cds--body-01"
          style={{ color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}
        >
          Beantragen Sie finanzielle Soforthilfe bei Hochwasserschäden. Schildern Sie den
          Sachverhalt möglichst genau — das beschleunigt die Bearbeitung.
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

      {/* Main Grid: Form + Aid Info */}
      <Grid narrow style={{ rowGap: '2rem' }}>
        <Column sm={4} md={8} lg={8}>
          <Tile style={{ padding: '1.5rem' }}>
            <h3 className="cds--productive-heading-03" style={{ marginBottom: '1.25rem' }}>
              Schaden melden
            </h3>
            <Form onSubmit={handleSubmit}>
              <FormGroup legendText="">
                <Stack gap={5}>
                  <TextArea
                    id="damageDescription"
                    labelText="Schadensbeschreibung *"
                    placeholder="Beschreiben Sie den entstandenen Schaden möglichst detailliert (max. 500 Zeichen)..."
                    value={damageDescription}
                    onChange={(e) => {
                      setDamageDescription(e.target.value);
                      if (fieldErrors.damageDescription)
                        setFieldErrors((prev) => ({ ...prev, damageDescription: undefined }));
                    }}
                    invalid={!!fieldErrors.damageDescription}
                    invalidText={fieldErrors.damageDescription}
                    maxCount={500}
                    enableCounter
                    rows={4}
                    required
                  />

                  <TextInput
                    id="affectedStreet"
                    labelText="Betroffene Straße *"
                    placeholder="z. B. Hauptstraße 12"
                    value={affectedStreet}
                    onChange={(e) => {
                      setAffectedStreet(e.target.value);
                      if (fieldErrors.affectedStreet)
                        setFieldErrors((prev) => ({ ...prev, affectedStreet: undefined }));
                    }}
                    invalid={!!fieldErrors.affectedStreet}
                    invalidText={fieldErrors.affectedStreet}
                    maxLength={200}
                    required
                  />

                  <TextInput
                    id="postcode"
                    labelText="Postleitzahl *"
                    placeholder="z. B. 80331"
                    helperText="5-stellige deutsche Postleitzahl"
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      if (fieldErrors.postcode)
                        setFieldErrors((prev) => ({ ...prev, postcode: undefined }));
                    }}
                    invalid={!!fieldErrors.postcode}
                    invalidText={fieldErrors.postcode}
                    maxLength={5}
                    required
                  />

                  <Select
                    id="severityLevel"
                    labelText="Schweregrad *"
                    value={severityLevel}
                    onChange={(e) => {
                      setSeverityLevel(e.target.value as FloodSeverityLevel | '');
                      if (fieldErrors.severityLevel)
                        setFieldErrors((prev) => ({ ...prev, severityLevel: undefined }));
                    }}
                    invalid={!!fieldErrors.severityLevel}
                    invalidText={fieldErrors.severityLevel}
                  >
                    <SelectItem disabled value="" text="Bitte auswählen..." />
                    {SEVERITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} text={opt.label} />
                    ))}
                  </Select>

                  {/* Readonly owner field */}
                  <TextInput
                    id="owner"
                    labelText="Antragsteller"
                    value={`${citizenName ?? 'Bürger'} (Angemeldeter Bürger)`}
                    readOnly
                    helperText="Der Antrag wird für den aktuell angemeldeten Bürger eingereicht."
                  />

                  <div
                    style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}
                  >
                    <Button type="submit" disabled={submitting} renderIcon={Send}>
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
              Hilfsprogramm &amp; Förderhöhen
            </h3>
            <StructuredListWrapper isCondensed>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Kategorie</StructuredListCell>
                  <StructuredListCell head>Förderhöhe</StructuredListCell>
                  <StructuredListCell head>Hinweis</StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {AID_INFO.map((item) => (
                  <StructuredListRow key={item.category}>
                    <StructuredListCell>
                      <strong>{item.category}</strong>
                    </StructuredListCell>
                    <StructuredListCell>{item.amount}</StructuredListCell>
                    <StructuredListCell
                      style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8125rem' }}
                    >
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
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Wichtige Hinweise:</p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, listStyleType: 'disc' }}>
                <li>Schäden müssen innerhalb von 14 Tagen nach dem Ereignis gemeldet werden.</li>
                <li>Fotografische Nachweise sind vor Aufräumarbeiten zu sichern.</li>
                <li>Bei akuter Gefahr wählen Sie bitte den Notruf 112.</li>
              </ul>
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Applications Table */}
      <div>
        <TableContainer
          title="Meine Hochwasserhilfe-Anträge"
          description="Übersicht aller eingereichten Anträge auf Hochwasserunterstützung"
        >
          {allRows.length === 0 ? (
            <Tile
              style={{ padding: '2rem', textAlign: 'center', color: 'var(--cds-text-secondary)' }}
            >
              Es wurden noch keine Anträge eingereicht.
            </Tile>
          ) : (
            <>
              <DataTable rows={paginatedRows} headers={headers} isSortable>
                {({
                  rows: tableRows,
                  headers: tableHeaders,
                  getTableProps,
                  getHeaderProps,
                  getRowProps,
                }) => (
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
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
              <Pagination
                backwardText="Vorherige Seite"
                forwardText="Nächste Seite"
                itemsPerPageText="Einträge pro Seite:"
                page={page}
                pageNumberText="Seitennummer"
                pageSize={pageSize}
                pageSizes={[5, 10, 25]}
                totalItems={allRows.length}
                onChange={({ page: newPage, pageSize: newPageSize }) => {
                  setPage(newPage);
                  setPageSize(newPageSize);
                }}
              />
            </>
          )}
        </TableContainer>
      </div>
    </Stack>
  );
}
