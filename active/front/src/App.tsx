import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { createAppRouter } from '@/routes/router'
import { AppThemeProvider } from '@/theme/AppThemeProvider'

const router = createAppRouter()

export function App() {
  return (
    <AppThemeProvider>
      <ErrorBoundary>
        <NotificationProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </AppThemeProvider>
  )
}
