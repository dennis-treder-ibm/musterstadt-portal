import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AddressPage } from '@/pages/AddressPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DogsPage } from '@/pages/DogsPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ParkingPage } from '@/pages/ParkingPage'
import { ProtectedRoute, PublicOnlyRoute } from './guards'
import { ROUTES } from './paths'

export const routes: RouteObject[] = [
  { path: ROUTES.root, element: <Navigate to={ROUTES.dashboard} replace /> },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.parking, element: <ParkingPage /> },
          { path: ROUTES.address, element: <AddressPage /> },
          { path: ROUTES.dogs, element: <DogsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
