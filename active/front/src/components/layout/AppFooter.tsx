import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const LINKS = ['Impressum', 'Datenschutz', 'Barrierefreiheit'] as const

/** Footer with copyright and legal links. */
export function AppFooter() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 2, px: 3, bgcolor: 'background.paper' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2024 Stadtverwaltung Musterstadt
        </Typography>
        <Stack component="nav" aria-label="Rechtliches" direction="row" spacing={2}>
          {LINKS.map((label) => (
            <Link key={label} href="#" color="inherit" underline="hover" variant="body2" onClick={(e) => e.preventDefault()}>
              {label}
            </Link>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
