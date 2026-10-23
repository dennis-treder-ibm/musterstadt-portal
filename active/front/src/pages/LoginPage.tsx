import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/routes/paths'
import { getUserMessage } from '@/utils/errorMessages'

/** Landing page: welcome message and sign-in (POST /api/auth/login). */
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ username, password })
      navigate(redirectTo, { replace: true })
    } catch (e) {
      setError(getUserMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ThemeModeToggle />
      </Box>
      <Card>
        <CardContent component="form" onSubmit={(e: FormEvent) => void handleSubmit(e)} noValidate sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Willkommen im Bürgerportal Musterstadt
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Melden Sie sich an, um Ihre Anträge online zu stellen.
          </Typography>

          {error && (
            <Alert severity="error" role="alert" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Kennwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting || !username || !password}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ mt: 2 }}
          >
            Anmelden
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}
