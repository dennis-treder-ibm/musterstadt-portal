import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AddressChangePage } from '@/pages/AddressChangePage'
import { AdminPage } from '@/pages/AdminPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DogRegistrationPage } from '@/pages/DogRegistrationPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ParkingPermitPage } from '@/pages/ParkingPermitPage'
import { PublicOnly, RequireAuth } from './guards'
import { paths } from './paths'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: paths.home, element: <LandingPage /> },
      { element: <PublicOnly />, children: [{ path: paths.login, element: <LoginPage /> }] },
      {
        element: <RequireAuth />,
        children: [
          { path: paths.dashboard, element: <DashboardPage /> },
          { path: paths.parkingPermit, element: <ParkingPermitPage /> },
          { path: paths.addressChange, element: <AddressChangePage /> },
          { path: paths.dogRegistration, element: <DogRegistrationPage /> },
          // The REST backend only issues the Citizen role; the admin area is a static placeholder
          // as in the legacy application, so any authenticated user may open it.
          { path: paths.admin, element: <AdminPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
