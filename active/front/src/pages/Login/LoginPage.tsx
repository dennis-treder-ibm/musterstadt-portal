import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Theme,
  Grid,
  Column,
  Stack,
  Form,
  FormGroup,
  TextInput,
  PasswordInput,
  Button,
  InlineNotification,
  Tile,
} from '@carbon/react';
import { Login } from '@carbon/react/icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LegalModals, type LegalModalType } from '@/components/layout/LegalModals';
import type { ApiError } from '@/types/api';

export default function LoginPage() {
  const { login } = useAuth();
  const { carbonTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [username, setUsername] = useState('buerger');
  const [password, setPassword] = useState('demo-password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Bitte geben Sie Benutzername und Kennwort ein.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({ username: username.trim(), password: password.trim() });
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as ApiError).error ?? 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Theme theme={carbonTheme}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--cds-background)',
        }}
      >
        <header
          style={{
            background: 'var(--cds-layer-01)',
            borderBottom: '1px solid var(--cds-border-subtle)',
            padding: '1rem 2rem',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                Bürgerportal Musterstadt
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginLeft: '1rem' }}>
                Ihr digitales Rathaus — rund um die Uhr erreichbar
              </span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
          <Grid style={{ width: '100%', maxWidth: '520px' }}>
            <Column sm={4} md={6} lg={12}>
              <Tile style={{ padding: '2rem' }}>
                <Stack gap={6}>
                  <div>
                    <h2 className="cds--productive-heading-04" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Login size={24} />
                      Anmeldung am Bürgerportal
                    </h2>
                    <p className="cds--body-01" style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                      Bitte melden Sie sich mit Ihren Zugangsdaten an.
                    </p>
                  </div>

                  {error && (
                    <InlineNotification
                      kind="error"
                      title="Anmeldefehler:"
                      subtitle={error}
                      lowContrast
                      onCloseButtonClick={() => setError(null)}
                    />
                  )}

                  <Form onSubmit={handleSubmit}>
                    <FormGroup legendText="">
                      <Stack gap={5}>
                        <TextInput
                          id="username"
                          labelText="Benutzername"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          autoComplete="username"
                          placeholder="z. B. buerger"
                          required
                        />
                        <PasswordInput
                          id="password"
                          labelText="Kennwort"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          placeholder="Kennwort eingeben"
                          required
                        />
                        <Button
                          type="submit"
                          disabled={loading}
                          renderIcon={Login}
                          style={{ width: '100%' }}
                        >
                          {loading ? 'Anmelden...' : 'Anmelden'}
                        </Button>
                      </Stack>
                    </FormGroup>
                  </Form>

                  <div
                    style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--cds-border-subtle)',
                      fontSize: '0.8125rem',
                      color: 'var(--cds-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    <p style={{ margin: '0 0 0.5rem 0' }}>
                      <strong>Demo-Zugangsdaten:</strong> Benutzername <code>buerger</code> / Kennwort <code>demo-password</code>
                    </p>
                    <p style={{ margin: 0 }}>
                      Passwort vergessen? Bitte wenden Sie sich an das Bürgerbüro der Stadtverwaltung (Tel. 089-12345-0).
                    </p>
                  </div>
                </Stack>
              </Tile>
            </Column>
          </Grid>
        </main>

        <footer
          style={{
            padding: '1.25rem 2rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--cds-text-secondary)',
            borderTop: '1px solid var(--cds-border-subtle)',
          }}
        >
          <span>&copy; 2024–2026 Stadtverwaltung Musterstadt &bull; </span>
          <Button
            kind="ghost"
            size="sm"
            onClick={() => setLegalModal('impressum')}
            style={{ minHeight: 'unset', padding: '0 4px', fontSize: '0.75rem' }}
          >
            Impressum
          </Button>
          <span> &bull; </span>
          <Button
            kind="ghost"
            size="sm"
            onClick={() => setLegalModal('datenschutz')}
            style={{ minHeight: 'unset', padding: '0 4px', fontSize: '0.75rem' }}
          >
            Datenschutz
          </Button>
        </footer>

        <LegalModals
          activeModal={legalModal}
          onClose={() => setLegalModal(null)}
        />
      </div>
    </Theme>
  );
}
