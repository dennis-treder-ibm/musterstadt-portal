import React from 'react';
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
} from '@carbon/react';
import {
  Dashboard,
  Logout,
  Light,
  Moon,
  Laptop,
} from '@carbon/react/icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Dashboard },
  { path: '/parking', label: 'Parkausweis', icon: null },
  { path: '/address', label: 'Adressänderung', icon: null },
  { path: '/dogs', label: 'Hunderegistrierung', icon: null },
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

      <SideNav aria-label="Seitennavigation" isFixedNav expanded={false}>
        <SideNavItems>
          <SideNavMenu title="Dienste" defaultExpanded>
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
          </SideNavMenu>
        </SideNavItems>
      </SideNav>

      <Content id="main-content">
        {citizenName && (
          <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
            Angemeldet als: <strong>{citizenName}</strong>
          </p>
        )}
        {children}
      </Content>
    </Theme>
  );
}
