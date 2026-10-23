import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { AppThemeProvider } from './AppThemeProvider'
import { DEFAULT_MODE } from './theme'

describe('theme modes', () => {
  it('defaults to system', () => {
    expect(DEFAULT_MODE).toBe('system')
  })

  it('offers system, light and dark with system selected by default', async () => {
    render(
      <AppThemeProvider>
        <ThemeModeToggle />
      </AppThemeProvider>,
    )

    const system = await screen.findByRole('button', { name: 'System' })
    expect(system).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Hell' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Dunkel' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches between modes', async () => {
    const user = userEvent.setup()
    render(
      <AppThemeProvider>
        <ThemeModeToggle />
      </AppThemeProvider>,
    )

    await user.click(await screen.findByRole('button', { name: 'Dunkel' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Dunkel' })).toHaveAttribute('aria-pressed', 'true'))

    await user.click(screen.getByRole('button', { name: 'Hell' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Hell' })).toHaveAttribute('aria-pressed', 'true'))
  })
})
