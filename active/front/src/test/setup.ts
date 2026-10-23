import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { setLogLevel } from '@/utils/logger'

// jsdom lacks matchMedia, which MUI's color-scheme handling and useMediaQuery rely on.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList
}

beforeEach(() => {
  setLogLevel('silent')
  window.sessionStorage.clear()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})
