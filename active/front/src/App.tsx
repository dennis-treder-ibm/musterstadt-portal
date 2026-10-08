import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InlineLoading } from '@carbon/react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/ui/ProtectedRoute';

const LoginPage = lazy(() => import('@/pages/Login/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));
const ParkingPermitPage = lazy(() => import('@/pages/Parking/ParkingPermitPage'));
const AddressChangePage = lazy(() => import('@/pages/Address/AddressChangePage'));
const DogRegistrationPage = lazy(() => import('@/pages/Dogs/DogRegistrationPage'));

const Spinner = () => (
  <div style={{ padding: '2rem' }}>
    <InlineLoading description="Laden..." />
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <Routes>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="parking" element={<ParkingPermitPage />} />
                        <Route path="address" element={<AddressChangePage />} />
                        <Route path="dogs" element={<DogRegistrationPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </AppShell>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
