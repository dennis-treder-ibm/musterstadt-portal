import TextField, { type TextFieldProps } from '@mui/material/TextField'

type FormTextFieldProps = Omit<TextFieldProps, 'error' | 'helperText' | 'variant'> & {
  /** Validation message; shows the field in the error state. */
  error?: string
  /** Hint text shown while there is no error. */
  hint?: string
}

/** TextField with consistent error/hint handling and ARIA wiring. */
export function FormTextField({ error, hint, slotProps, ...rest }: FormTextFieldProps) {
  return (
    <TextField
      variant="outlined"
      fullWidth
      error={Boolean(error)}
      helperText={error ?? hint}
      slotProps={{
        ...slotProps,
        htmlInput: { 'aria-invalid': Boolean(error), ...(slotProps?.htmlInput as object | undefined) },
      }}
      {...rest}
    />
  )
}
