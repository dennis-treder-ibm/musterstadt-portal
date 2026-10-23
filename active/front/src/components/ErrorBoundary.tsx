import { Component, type ErrorInfo, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { logger } from '@/utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback; receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** Changing any value in this array resets the boundary (e.g. the current route path). */
  resetKeys?: readonly unknown[]
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

function keysChanged(a: readonly unknown[] = [], b: readonly unknown[] = []): boolean {
  return a.length !== b.length || a.some((value, index) => !Object.is(value, b[index]))
}

/** Catches render errors of its subtree so one failing component does not blank the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error(`Unhandled render error: ${error.message}`, { componentStack: info.componentStack })
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error && keysChanged(prevProps.resetKeys, this.props.resetKeys)) this.reset()
  }

  reset = (): void => this.setState({ error: null })

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(error, this.reset)

    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={this.reset}>
              Erneut versuchen
            </Button>
          }
        >
          <AlertTitle>Etwas ist schiefgelaufen</AlertTitle>
          Dieser Bereich konnte nicht angezeigt werden. Bitte versuchen Sie es erneut.
        </Alert>
      </Box>
    )
  }
}
