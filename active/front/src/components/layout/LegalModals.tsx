import { InfoModal } from '@/components/common/InfoModal';

export type LegalModalType = 'impressum' | 'datenschutz' | 'barrierefreiheit' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export function LegalModals({ activeModal, onClose }: LegalModalsProps) {
  return (
    <>
      <InfoModal
        open={activeModal === 'impressum'}
        title="Impressum"
        onClose={onClose}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p><strong>Stadtverwaltung Musterstadt</strong></p>
          <p>Rathausplatz 1<br />80331 Musterstadt<br />Deutschland</p>
          <p><strong>Vertreten durch:</strong><br />Die Oberbürgermeisterin / Der Oberbürgermeister</p>
          <p><strong>Kontakt:</strong><br />Telefon: 089-12345-0<br />E-Mail: buergerbuero@musterstadt.de</p>
          <p><strong>Zuständige Aufsichtsbehörde:</strong><br />Regierungspräsidium Musterstadt</p>
        </div>
      </InfoModal>

      <InfoModal
        open={activeModal === 'datenschutz'}
        title="Datenschutzerklärung"
        onClose={onClose}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            Der Schutz Ihrer persönlichen Daten ist der Stadtverwaltung Musterstadt ein besonderes Anliegen.
            Wir verarbeiten Ihre Daten ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, BDSG, LDSG).
          </p>
          <p><strong>1. Datenerhebung bei Antragstellung</strong><br />
            Bei Nutzung unserer Onlinedienste (Parkausweis, Adressänderung, Hundeanmeldung) werden die für das jeweilige
            Verwaltungsverfahren erforderlichen Daten erhoben und gespeichert.
          </p>
          <p><strong>2. Speicherdauer</strong><br />
            Ihre Antragsdaten werden nach den gesetzlichen Aufbewahrungsfristen der Kommunalverwaltung verarbeitet und gelöscht.
          </p>
          <p><strong>3. Ihre Rechte</strong><br />
            Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Sperrung oder Löschung Ihrer gespeicherten Daten.
          </p>
        </div>
      </InfoModal>

      <InfoModal
        open={activeModal === 'barrierefreiheit'}
        title="Erklärung zur Barrierefreiheit"
        onClose={onClose}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            Die Stadtverwaltung Musterstadt ist bemüht, ihr Bürgerportal im Einklang mit den nationalen
            Rechtsvorschriften zur Umsetzung der Richtlinie (EU) 2016/2102 barrierefrei zugänglich zu machen.
          </p>
          <p><strong>Stand der Vereinbarkeit mit den Anforderungen:</strong><br />
            Diese Webanwendung wurde mit dem IBM Carbon Design System modernisiert und erfüllt die Anforderungen der
            Web Content Accessibility Guidelines (WCAG) 2.1 auf Konformitätsstufe AA.
          </p>
          <p><strong>Barrierefreie Funktionen:</strong></p>
          <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
            <li>Vollständige Tastaturbedienbarkeit</li>
            <li>ARIA-Attribute und Screenreader-Unterstützung</li>
            <li>Ausreichende Farbkontraste (heller &amp; dunkler Modus)</li>
            <li>Responsive Darstellung auf allen Bildschirmgrößen</li>
          </ul>
        </div>
      </InfoModal>
    </>
  );
}
