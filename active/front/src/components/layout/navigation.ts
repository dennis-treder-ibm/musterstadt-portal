import { paths } from '@/router/paths'

export interface NavItem {
  to: string
  label: string
}

/** Primary navigation (legacy layout.xhtml left menu). */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: paths.dashboard, label: 'Startseite' },
  { to: paths.parkingPermit, label: 'Parkausweis' },
  { to: paths.addressChange, label: 'Adressänderung' },
  { to: paths.dogRegistration, label: 'Hundeanmeldung' },
]

/** Announced-but-unavailable area, rendered disabled. */
export const DISABLED_NAV_ITEM = { label: 'Hochwasserhilfe', hint: 'Demnächst verfügbar' } as const

export const DRAWER_WIDTH = 260
