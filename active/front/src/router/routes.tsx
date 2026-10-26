import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { Role } from '@/types/domain'
import { PublicOnly, RequireAuth } from './guards'
import { paths } from './paths'

const placeholder = (title: string, description: string) => (
  <PlaceholderPage title={title} description={description} />
)

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: paths.home, element: <LandingPage /> },
      { element: <PublicOnly />, children: [{ path: paths.login, element: <LoginPage /> }] },
      {
        element: <RequireAuth />,
        children: [
          { path: paths.dashboard, element: placeholder('Startseite', 'Statistik und letzte Aktivitäten folgen in der Komponenten-Phase.') },
          { path: paths.parkingPermit, element: placeholder('Parkausweis beantragen', 'Das Antragsformular folgt in der Komponenten-Phase.') },
          { path: paths.addressChange, element: placeholder('Adressänderung melden', 'Das Antragsformular folgt in der Komponenten-Phase.') },
          { path: paths.dogRegistration, element: placeholder('Hund anmelden', 'Formular, Suche und Tabelle folgen in der Komponenten-Phase.') },
        ],
      },
      {
        element: <RequireAuth roles={[Role.Admin]} />,
        children: [{ path: paths.admin, element: placeholder('Verwaltung', 'Der Admin-Bereich ist noch ein Platzhalter.') }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
