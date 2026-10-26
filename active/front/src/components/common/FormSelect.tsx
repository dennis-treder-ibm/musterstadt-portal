import MenuItem from '@mui/material/MenuItem'
import TextField, { type TextFieldProps } from '@mui/material/TextField'

interface FormSelectProps extends Omit<TextFieldProps, 'error' | 'helperText' | 'variant' | 'select' | 'children'> {
  options: ReadonlyArray<{ value: string; label: string }>
  error?: string
  hint?: string
  /** Label of the empty option, e.g. "— Bitte wählen —". */
  placeholder?: string
}

/** Select (native MUI menu) with the same error/hint behaviour as `FormTextField`. */
export function FormSelect({ options, error, hint, placeholder = '— Bitte wählen —', ...rest }: FormSelectProps) {
  return (
    <TextField select fullWidth error={Boolean(error)} helperText={error ?? hint} {...rest}>
      <MenuItem value="">
        <em>{placeholder}</em>
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
