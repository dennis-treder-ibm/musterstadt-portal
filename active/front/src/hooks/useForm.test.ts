import { act, renderHook } from '@testing-library/react'
import { ApiError } from '@/services'
import { required } from '@/utils/validation'
import { useForm } from './useForm'

const initialValues = { name: '' }
const rules = { name: required('Pflichtfeld') }

function setup(onSubmit = vi.fn().mockResolvedValue(undefined), onSuccess = vi.fn()) {
  const hook = renderHook(() => useForm({ initialValues, rules, onSubmit, onSuccess }))
  return { ...hook, onSubmit, onSuccess }
}

describe('useForm', () => {
  it('shows validation errors only after blur and blocks invalid submit', async () => {
    const { result, onSubmit } = setup()
    expect(result.current.errorFor('name')).toBeUndefined()

    act(() => result.current.getFieldProps('name').onBlur())
    expect(result.current.errorFor('name')).toBe('Pflichtfeld')

    await act(() => result.current.handleSubmit())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid values, resets and calls onSuccess', async () => {
    const { result, onSubmit, onSuccess } = setup()
    act(() => result.current.setValue('name', 'Rex'))
    await act(() => result.current.handleSubmit())

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Rex' })
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(result.current.values.name).toBe('')
    expect(result.current.submitting).toBe(false)
  })

  it('maps backend errors to submitError and field errors', async () => {
    const error = new ApiError('validation', 'invalid', { status: 400, fieldErrors: [{ field: 'name', message: 'Bereits vergeben' }] })
    const { result, onSuccess } = setup(vi.fn().mockRejectedValue(error))
    act(() => result.current.setValue('name', 'Rex'))
    await act(() => result.current.handleSubmit())

    expect(result.current.submitError).toBe('Bereits vergeben')
    expect(result.current.errorFor('name')).toBe('Bereits vergeben')
    expect(onSuccess).not.toHaveBeenCalled()
    expect(result.current.values.name).toBe('Rex')

    act(() => result.current.setValue('name', 'Rex2'))
    expect(result.current.errorFor('name')).toBeUndefined()
  })
})
