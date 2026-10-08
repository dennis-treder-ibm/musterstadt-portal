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
} from '@carbon/react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { ApiError } from '@/types/api';

export default function LoginPage() {
  const { login } = useAuth();
  const { carbonTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as ApiError).error ?? 'Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Theme theme={carbonTheme}>
      <Grid style={{ minHeight: '100vh', alignItems: 'center' }}>
        <Column sm={4} md={{ span: 4, offset: 2 }} lg={{ span: 4, offset: 6 }}>
          <Stack gap={6} style={{ paddingTop: '4rem' }}>
            <div>
              <h1 className="cds--productive-heading-05">Bürgerportal Musterstadt</h1>
              <p className="cds--body-01" style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                Bitte melden Sie sich an, um fortzufahren.
              </p>
            </div>

            {error && (
              <InlineNotification
                kind="error"
                title="Fehler:"
                subtitle={error}
                lowContrast
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
                    required
                  />
                  <PasswordInput
                    id="password"
                    labelText="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Anmelden...' : 'Anmelden'}
                  </Button>
                </Stack>
              </FormGroup>
            </Form>

            <p className="cds--helper-text">
              Demo-Zugangsdaten: <code>buerger</code> / <code>demo-password</code>
            </p>
          </Stack>
        </Column>
      </Grid>
    </Theme>
  );
}
