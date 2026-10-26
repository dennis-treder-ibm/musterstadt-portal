/**
 * Route map derived from the navigation rules in back/architecture.md (5.3).
 * Single source of truth for URLs - never hard-code paths elsewhere.
 */
export const paths = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  parkingPermit: '/parking',
  addressChange: '/address',
  dogRegistration: '/dogs',
  admin: '/admin',
} as const

export type AppPath = (typeof paths)[keyof typeof paths]
