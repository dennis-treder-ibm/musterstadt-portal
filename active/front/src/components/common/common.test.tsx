import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplicationStatus } from '@/types/domain'
import { ConfirmDialog } from './ConfirmDialog'
import { ErrorAlert } from './ErrorAlert'
import { FormTextField } from './FormTextField'
import { StatusChip } from './StatusChip'

describe('common components', () => {
  it('StatusChip shows text labels for every status', () => {
    render(
      <>
        <StatusChip status={ApplicationStatus.Pending} />
        <StatusChip status={ApplicationStatus.Approved} />
        <StatusChip status={ApplicationStatus.Rejected} />
      </>,
    )
    expect(screen.getByText('Ausstehend')).toBeInTheDocument()
    expect(screen.getByText('Genehmigt')).toBeInTheDocument()
    expect(screen.getByText('Abgelehnt')).toBeInTheDocument()
  })

  it('ErrorAlert is an alert and offers retry only when requested', async () => {
    const onRetry = vi.fn()
    const { rerender } = render(<ErrorAlert message="Fehler" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Fehler')
    await userEvent.click(screen.getByRole('button', { name: 'Erneut versuchen' }))
    expect(onRetry).toHaveBeenCalledOnce()

    rerender(<ErrorAlert message="Fehler" />)
    expect(screen.queryByRole('button', { name: 'Erneut versuchen' })).not.toBeInTheDocument()
  })

  it('ConfirmDialog calls confirm and cancel handlers', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="Löschen?" message="Wirklich?" onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByRole('dialog', { name: 'Löschen?' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Bestätigen' }))
    await userEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('FormTextField shows the error instead of the hint and marks the input invalid', () => {
    const { rerender } = render(<FormTextField label="Name" hint="Hinweis" />)
    expect(screen.getByText('Hinweis')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'false')

    rerender(<FormTextField label="Name" hint="Hinweis" error="Pflichtfeld" />)
    expect(screen.getByText('Pflichtfeld')).toBeInTheDocument()
    expect(screen.queryByText('Hinweis')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
  })
})
