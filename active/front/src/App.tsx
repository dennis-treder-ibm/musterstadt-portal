import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AuthProvider } from '@/context/AuthProvider'
import { createAppRouter } from '@/router/routes'
import { AppThemeProvider } from '@/theme/AppThemeProvider'

export default function App() {
  const [router] = useState(createAppRouter)

  return (
    <AppThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>
    </AppThemeProvider>
  )
}
