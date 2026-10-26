import { useColorScheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

type Mode = 'system' | 'light' | 'dark'

const OPTIONS: ReadonlyArray<{ value: Mode; label: string; icon: React.ReactElement }> = [
  { value: 'system', label: 'System', icon: <BrightnessAutoIcon fontSize="small" /> },
  { value: 'light', label: 'Hell', icon: <LightModeIcon fontSize="small" /> },
  { value: 'dark', label: 'Dunkel', icon: <DarkModeIcon fontSize="small" /> },
]

export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme()
  if (!mode) return null // not yet resolved on first render

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={mode}
      aria-label="Farbschema"
      onChange={(_, next: Mode | null) => next && setMode(next)}
      sx={{ bgcolor: 'background.paper' }}
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <ToggleButton key={value} value={value} aria-label={label}>
          <Tooltip title={label}>{icon}</Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
