import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import Alert, { type AlertColor } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { getUserMessage } from '@/utils/errorMessages'

interface Notification {
  key: number
  message: string
  severity: AlertColor
}

interface NotificationContextValue {
  notify: (message: string, severity?: AlertColor) => void
  notifySuccess: (message: string) => void
  /** Converts any thrown value into a user-friendly message and shows it as an error. */
  notifyError: (error: unknown) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

/** Central snackbar so pages report success/failure consistently. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Notification | null>(null)

  const notify = useCallback((message: string, severity: AlertColor = 'info') => {
    setCurrent({ key: Date.now(), message, severity })
  }, [])

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      notifySuccess: (message) => notify(message, 'success'),
      notifyError: (error) => notify(getUserMessage(error), 'error'),
    }),
    [notify],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.key}
        open={current !== null}
        autoHideDuration={6000}
        onClose={(_, reason) => reason !== 'clickaway' && setCurrent(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {current ? (
          <Alert severity={current.severity} variant="filled" onClose={() => setCurrent(null)} sx={{ width: '100%' }}>
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification must be used within a NotificationProvider')
  return context
}
