import { Component, type ErrorInfo, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { logger } from '@/utils/logger'

interface Props {
  children: ReactNode
  /** Custom fallback renderer; receives a `reset` callback. */
  fallback?: (reset: () => void) => ReactNode
  /** Changing any of these values resets the boundary (e.g. the route path). */
  resetKeys?: ReadonlyArray<unknown>
}

interface State {
  hasError: boolean
}

/** Catches render-time errors of the subtree and shows a friendly fallback. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled UI error', { message: error.message, componentStack: info.componentStack ?? undefined })
  }

  override componentDidUpdate(prev: Props): void {
    const changed =
      this.state.hasError &&
      (prev.resetKeys?.length !== this.props.resetKeys?.length ||
        prev.resetKeys?.some((key, i) => !Object.is(key, this.props.resetKeys?.[i])))
    if (changed) this.reset()
  }

  private reset = (): void => this.setState({ hasError: false })

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback(this.reset)

    return (
      <Box sx={{ p: 3 }}>
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
