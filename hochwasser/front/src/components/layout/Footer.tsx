import { Button } from '@carbon/react';

interface FooterProps {
  onOpenImpressum: () => void;
  onOpenDatenschutz: () => void;
  onOpenBarrierefreiheit: () => void;
}

export function Footer({
  onOpenImpressum,
  onOpenDatenschutz,
  onOpenBarrierefreiheit,
}: FooterProps) {
  return (
    <footer
      style={{
        marginTop: '3rem',
        padding: '1.5rem 2rem',
        borderTop: '1px solid var(--cds-border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.75rem',
        color: 'var(--cds-text-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span>&copy; 2024–2026 Stadtverwaltung Musterstadt</span>
        <span>&bull;</span>
        <Button
          kind="ghost"
          size="sm"
          onClick={onOpenImpressum}
          style={{ minHeight: 'unset', padding: '0 4px', fontSize: '0.75rem' }}
        >
          Impressum
        </Button>
        <span>&bull;</span>
        <Button
          kind="ghost"
          size="sm"
          onClick={onOpenDatenschutz}
          style={{ minHeight: 'unset', padding: '0 4px', fontSize: '0.75rem' }}
        >
          Datenschutz
        </Button>
        <span>&bull;</span>
        <Button
          kind="ghost"
          size="sm"
          onClick={onOpenBarrierefreiheit}
          style={{ minHeight: 'unset', padding: '0 4px', fontSize: '0.75rem' }}
        >
          Barrierefreiheit
        </Button>
      </div>
      <div>
        <span>Portal Version 4.0 (Quarkus &amp; Carbon)</span>
      </div>
    </footer>
  );
}
