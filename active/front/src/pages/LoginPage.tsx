import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FormActions } from '@/components/common/FormActions'
import { FormTextField } from '@/components/common/FormTextField'
import { useAuth } from '@/context/useAuth'
import { useForm } from '@/hooks/useForm'
import { paths } from '@/router/paths'
import { getUserMessage, isApiError } from '@/services'
import { required } from '@/utils/validation'

interface LocationState {
  from?: { pathname?: string }
}

const INITIAL = { username: '', password: '' }
const RULES = {
  username: required('Bitte geben Sie Ihren Benutzernamen ein.'),
  password: required('Bitte geben Sie Ihr Kennwort ein.'),
}
const LOGIN_FAILED = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginError, setLoginError] = useState<string | null>(null)

  const form = useForm({
    initialValues: INITIAL,
    rules: RULES,
    resetOnSuccess: false,
    onSubmit: async ({ username, password }) => {
      setLoginError(null)
      try {
        await login(username.trim(), password)
      } catch (error) {
        // A 401 on login means bad credentials, not an expired session.
        setLoginError(isApiError(error) && error.kind === 'unauthorized' ? LOGIN_FAILED : getUserMessage(error))
        throw error
      }
    },
    onSuccess: () => {
      const target = (location.state as LocationState | null)?.from?.pathname ?? paths.dashboard
      navigate(target, { replace: true })
    },
  })

  return (
    <Paper component="form" onSubmit={form.handleSubmit} variant="outlined" sx={{ p: 4, maxWidth: 440, mx: 'auto' }} noValidate>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Anmeldung am Bürgerportal
        </Typography>
        <Typography color="text.secondary">Bitte melden Sie sich mit Ihren Zugangsdaten an.</Typography>
        {loginError && <Alert severity="error" role="alert">{loginError}</Alert>}
        <FormTextField label="Benutzername" autoComplete="username" required autoFocus {...form.getFieldProps('username')} />
        <FormTextField label="Kennwort" type="password" autoComplete="current-password" required {...form.getFieldProps('password')} />
        <FormActions submitLabel="Anmelden" submitting={form.submitting} />
        <Typography variant="body2" color="text.secondary">
          Passwort vergessen? Bitte wenden Sie sich an die Stadtverwaltung.
        </Typography>
      </Stack>
    </Paper>
  )
}
