import { useEffect, useState } from 'react';
import {
  Grid,
  Column,
  Stack,
  Tile,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  InlineLoading,
  InlineNotification,
  Tag,
} from '@carbon/react';
import { dashboardService } from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';
import type { DashboardData, ApplicationStatus } from '@/types/api';
import type { ApiError } from '@/types/api';

const STATUS_KIND: Record<ApplicationStatus, 'blue' | 'green' | 'red'> = {
  PENDING: 'blue',
  APPROVED: 'green',
  REJECTED: 'red',
};

const TYPE_LABEL: Record<string, string> = {
  PARKING: 'Parkausweis',
  ADDRESS: 'Adressänderung',
  DOG: 'Hund',
};

export default function DashboardPage() {
  const { citizenId } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!citizenId) return;
    dashboardService
      .get(citizenId)
      .then(setData)
      .catch((e: ApiError) => setError(e.error))
      .finally(() => setLoading(false));
  }, [citizenId]);

  if (loading) return <InlineLoading description="Laden..." />;
  if (error) return <InlineNotification kind="error" title="Fehler:" subtitle={error} lowContrast />;
  if (!data) return null;

  const headers = [
    { key: 'id', header: 'ID' },
    { key: 'type', header: 'Typ' },
    { key: 'status', header: 'Status' },
    { key: 'createdDate', header: 'Datum' },
  ];

  const rows = data.recentApplications.map((a) => ({
    id: String(a.id),
    type: TYPE_LABEL[a.type] ?? a.type,
    status: a.status,
    createdDate: a.createdDate,
  }));

  return (
    <Stack gap={7}>
      <h2 className="cds--productive-heading-04">Dashboard</h2>

      <Grid narrow>
        <Column sm={2} md={2} lg={3}>
          <Tile>
            <p className="cds--label-01">Gesamt Anträge</p>
            <p className="cds--productive-heading-06">{data.totalApplications}</p>
          </Tile>
        </Column>
        <Column sm={2} md={2} lg={3}>
          <Tile>
            <p className="cds--label-01">Ausstehend</p>
            <p className="cds--productive-heading-06" style={{ color: 'var(--cds-link-01)' }}>{data.pendingCount}</p>
          </Tile>
        </Column>
        <Column sm={2} md={2} lg={3}>
          <Tile>
            <p className="cds--label-01">Genehmigt</p>
            <p className="cds--productive-heading-06" style={{ color: 'var(--cds-support-success)' }}>{data.approvedCount}</p>
          </Tile>
        </Column>
        <Column sm={2} md={2} lg={3}>
          <Tile>
            <p className="cds--label-01">Abgelehnt</p>
            <p className="cds--productive-heading-06" style={{ color: 'var(--cds-support-error)' }}>{data.rejectedCount}</p>
          </Tile>
        </Column>
      </Grid>

      <Grid narrow>
        <Column sm={2} md={2} lg={4}>
          <Tile><p className="cds--label-01">Parkausweise</p><p className="cds--productive-heading-04">{data.parkingPermitCount}</p></Tile>
        </Column>
        <Column sm={2} md={2} lg={4}>
          <Tile><p className="cds--label-01">Adressänderungen</p><p className="cds--productive-heading-04">{data.addressChangeCount}</p></Tile>
        </Column>
        <Column sm={2} md={2} lg={4}>
          <Tile><p className="cds--label-01">Hunderegistrierungen</p><p className="cds--productive-heading-04">{data.dogRegistrationCount}</p></Tile>
        </Column>
      </Grid>

      <div>
        <h3 className="cds--productive-heading-03" style={{ marginBottom: '1rem' }}>Letzte Aktivitäten</h3>
        <DataTable rows={rows} headers={headers}>
          {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {tableHeaders.map((h) => (
                    <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.info.header === 'status' ? (
                          <Tag type={STATUS_KIND[cell.value as ApplicationStatus]}>{cell.value}</Tag>
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
      </div>
    </Stack>
  );
}
