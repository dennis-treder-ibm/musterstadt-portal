import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react'
import { getFieldErrorMap, getUserMessage } from '@/services'
import { validateForm, type Validator } from '@/utils/validation'

export type FormRules<T extends Record<string, string>> = { [K in keyof T]?: Validator }
export type FormErrors<T extends Record<string, string>> = Partial<Record<keyof T, string>>

export interface UseFormOptions<T extends Record<string, string>> {
  initialValues: T
  rules: FormRules<T>
  /** Called with the validated values; a rejection is shown as `submitError` / field errors. */
  onSubmit: (values: T) => Promise<void>
  /** Called after a successful submit (e.g. to show a success message). */
  onSuccess?: () => void
  /** Reset the form to its initial values after a successful submit. Default: true. */
  resetOnSuccess?: boolean
}

/**
 * Minimal controlled-form state: values, touched/validation errors, submit state
 * and mapping of backend errors. Validators come from `utils/validation`.
 */
export function useForm<T extends Record<string, string>>({
  initialValues,
  rules,
  onSubmit,
  onSuccess,
  resetOnSuccess = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validationErrors = validateForm(values, rules)

  /** Error to display for a field: shown once touched/submitted, backend errors take effect immediately. */
  const errorFor = (name: keyof T): string | undefined =>
    (touched[name] ? validationErrors[name] : undefined) ?? serverErrors[name as string]

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setServerErrors((prev) => {
      const key = String(name)
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const handleChange = useCallback(
    (name: keyof T) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(name, event.target.value as T[keyof T])
    },
    [setValue],
  )

  const handleBlur = useCallback(
    (name: keyof T) => () => setTouched((prev) => ({ ...prev, [name]: true })),
    [],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setTouched({})
    setServerErrors({})
    setSubmitError(null)
  }, [initialValues])

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault()
      setSubmitError(null)
      const errors = validateForm(values, rules)
      if (Object.keys(errors).length > 0) {
        setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])) as Partial<Record<keyof T, boolean>>)
        return
      }
      setSubmitting(true)
      try {
        await onSubmit(values)
        if (resetOnSuccess) reset()
        onSuccess?.()
      } catch (error) {
        setServerErrors(getFieldErrorMap(error))
        setSubmitError(getUserMessage(error))
      } finally {
        setSubmitting(false)
      }
    },
    [values, rules, onSubmit, onSuccess, resetOnSuccess, reset],
  )

  /** Props to spread onto `FormTextField` / `FormSelect`. */
  const getFieldProps = (name: keyof T & string) => ({
    name,
    value: values[name],
    onChange: handleChange(name),
    onBlur: handleBlur(name),
    error: errorFor(name),
  })

  return {
    values,
    errorFor,
    getFieldProps,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    submitting,
    submitError,
    clearSubmitError: useCallback(() => setSubmitError(null), []),
  }
}
