import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { paths } from '@/router/paths'
import { getUserMessage } from '@/services'

interface LocationState {
  from?: { pathname?: string }
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      const target = (location.state as LocationState | null)?.from?.pathname ?? paths.dashboard
      navigate(target, { replace: true })
    } catch (e) {
      setError(getUserMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: 4, maxWidth: 420, mx: 'auto' }} noValidate>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Anmeldung
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Benutzername" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required autoFocus />
        <TextField label="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        <Button type="submit" variant="contained" disabled={submitting || !username || !password}>
          Anmelden
        </Button>
      </Stack>
    </Paper>
  )
}
