import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useColorScheme } from '@mui/material/styles'

type Mode = 'system' | 'light' | 'dark'

const OPTIONS: { value: Mode; label: string; icon: React.ReactElement }[] = [
  { value: 'system', label: 'System', icon: <BrightnessAutoIcon fontSize="small" /> },
  { value: 'light', label: 'Hell', icon: <LightModeIcon fontSize="small" /> },
  { value: 'dark', label: 'Dunkel', icon: <DarkModeIcon fontSize="small" /> },
]

/** Three-way palette mode switch: system (default) / light / dark. */
export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme()
  // mode is undefined during the first render until the stored preference is read.
  if (!mode) return null

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={mode}
      onChange={(_, next: Mode | null) => next && setMode(next)}
      aria-label="Farbschema"
      color="primary"
      sx={{ bgcolor: 'background.paper' }}
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <ToggleButton key={value} value={value} aria-label={label} title={label}>
          {icon}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
