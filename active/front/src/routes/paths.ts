/**
 * Route paths, derived from the JSF navigation map in architecture.md §6.4:
 *   /login.xhtml -> login            /dashboard.xhtml -> dashboard
 *   /parking/parkingPermit.xhtml -> parking
 *   /address/addressChange.xhtml -> address
 *   /dog/dogRegistration.xhtml   -> dogs
 * "Hochwasserhilfe" (flood assistance) is a disabled stub in the legacy portal and has no route.
 */
export const ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  parking: '/parking',
  address: '/address',
  dogs: '/dogs',
} as const

export interface NavItem {
  label: string
  path: string
  disabled?: boolean
  hint?: string
}

/** Sidebar entries (German labels as in layout.xhtml). */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Startseite', path: ROUTES.dashboard },
  { label: 'Parkausweis', path: ROUTES.parking },
  { label: 'Adressänderung', path: ROUTES.address },
  { label: 'Hundeanmeldung', path: ROUTES.dogs },
  { label: 'Hochwasserhilfe', path: '#', disabled: true, hint: 'Demnächst verfügbar' },
]
