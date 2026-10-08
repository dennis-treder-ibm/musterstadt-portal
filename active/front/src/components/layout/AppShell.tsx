import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  Content,
  Theme,
  Tag,
} from '@carbon/react';
import {
  Dashboard,
  Car,
  Home,
  User,
  Logout,
  Light,
  Moon,
  Laptop,
  Help,
} from '@carbon/react/icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Footer } from '@/components/layout/Footer';
import { LegalModals, type LegalModalType } from '@/components/layout/LegalModals';

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Startseite', icon: Dashboard },
  { path: '/parking', label: 'Parkausweis', icon: Car },
  { path: '/address', label: 'Adressänderung', icon: Home },
  { path: '/dogs', label: 'Hundeanmeldung', icon: User },
];

const THEME_ICONS: Record<ThemeMode, React.ElementType> = {
  system: Laptop,
  light: Light,
  dark: Moon,
};

const NEXT_THEME: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

export default function AppShell({ children }: AppShellProps) {
  const { citizenName, logout } = useAuth();
  const { mode, carbonTheme, setMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  const ThemeIcon = THEME_ICONS[mode];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Theme theme={carbonTheme}>
      <Header aria-label="Bürgerportal Musterstadt">
        <SkipToContent href="#main-content" />
        <HeaderName prefix="Bürgerportal">Musterstadt</HeaderName>
        <HeaderNavigation aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => (
            <HeaderMenuItem
              key={item.path}
              isCurrentPage={location.pathname === item.path}
              as={Link}
              to={item.path}
            >
              {item.label}
            </HeaderMenuItem>
          ))}
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label={`Theme: ${mode} (klicken zum Wechseln)`}
            onClick={() => setMode(NEXT_THEME[mode])}
            tooltipAlignment="end"
          >
            <ThemeIcon size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label="Abmelden"
            tooltipAlignment="end"
            onClick={handleLogout}
          >
            <Logout size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <SideNav aria-label="Seitennavigation" isFixedNav expanded={true}>
        <SideNavItems>
          <SideNavMenu title="Online-Dienste" defaultExpanded>
            {NAV_ITEMS.map((item) => (
              <SideNavMenuItem
                key={item.path}
                isActive={location.pathname === item.path}
                as={Link}
                to={item.path}
              >
                {item.label}
              </SideNavMenuItem>
            ))}
            <div
              style={{
                padding: '0.75rem 1rem',
                opacity: 0.6,
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              title="Demnächst verfügbar"
            >
              <span style={{ fontSize: '0.875rem' }}>Hochwasserhilfe</span>
              <Tag type="warm-gray" size="sm">Demnächst</Tag>
            </div>
          </SideNavMenu>

          <div
            style={{
              marginTop: 'auto',
              padding: '1.25rem 1rem',
              borderTop: '1px solid var(--cds-border-subtle)',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              color: 'var(--cds-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Help size={16} />
              <span>Information &amp; Kontakt</span>
            </div>
            <p style={{ margin: '0 0 0.25rem 0' }}><strong>Öffnungszeiten Bürgerbüro:</strong></p>
            <p style={{ margin: 0 }}>Mo–Fr: 08:00–18:00</p>
            <p style={{ margin: '0 0 0.5rem 0' }}>Sa: 09:00–13:00</p>
            <p style={{ margin: 0 }}><strong>Support Hotline:</strong></p>
            <p style={{ margin: 0 }}>Tel. 089-12345-0</p>
          </div>
        </SideNavItems>
      </SideNav>

      <Content id="main-content" style={{ minHeight: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, paddingBottom: '2rem' }}>
          {citizenName && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                background: 'var(--cds-layer-01)',
                borderLeft: '4px solid var(--cds-interactive)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '0 4px 4px 0',
              }}
            >
              <div>
                <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Angemeldet als: </span>
                <strong style={{ fontSize: '0.875rem' }}>{citizenName}</strong>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                Bürger-ID: 1
              </span>
            </div>
          )}
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>

        <Footer
          onOpenImpressum={() => setLegalModal('impressum')}
          onOpenDatenschutz={() => setLegalModal('datenschutz')}
          onOpenBarrierefreiheit={() => setLegalModal('barrierefreiheit')}
        />

        <LegalModals
          activeModal={legalModal}
          onClose={() => setLegalModal(null)}
        />
      </Content>
    </Theme>
  );
}
