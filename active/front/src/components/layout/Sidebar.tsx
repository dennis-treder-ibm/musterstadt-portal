import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { NavLink } from 'react-router-dom'
import { DISABLED_NAV_ITEM, DRAWER_WIDTH, NAV_ITEMS } from './navigation'

interface SidebarProps {
  /** Controls the temporary drawer on small viewports. */
  mobileOpen: boolean
  onClose: () => void
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box component="nav" aria-label="Hauptnavigation" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List>
        {NAV_ITEMS.map(({ to, label }) => (
          <ListItem key={to} disablePadding>
            <ListItemButton
              component={NavLink}
              to={to}
              onClick={onNavigate}
              sx={{ '&.active': { bgcolor: 'action.selected', fontWeight: 600 } }}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton disabled aria-disabled="true">
            <ListItemText primary={DISABLED_NAV_ITEM.label} secondary={DISABLED_NAV_ITEM.hint} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box component="aside" aria-label="Öffnungszeiten und Kontakt" sx={{ p: 2 }}>
        <Typography variant="subtitle2" component="h2" gutterBottom>
          Öffnungszeiten
        </Typography>
        <Typography variant="body2">Mo–Fr: 08:00–18:00 Uhr</Typography>
        <Typography variant="body2" gutterBottom>
          Sa: 09:00–13:00 Uhr
        </Typography>
        <Typography variant="subtitle2" component="h2" sx={{ mt: 1 }}>
          Technischer Support
        </Typography>
        <Typography variant="body2">Tel. 089-12345-0</Typography>
      </Box>
    </Box>
  )
}

/** Left navigation: permanent on desktop, temporary drawer on mobile. */
export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const paperSx = { width: DRAWER_WIDTH, boxSizing: 'border-box' } as const
  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        <Toolbar />
        <SidebarContent onNavigate={onClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{ display: { xs: 'none', md: 'block' }, width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': paperSx }}
      >
        <Toolbar />
        <SidebarContent />
      </Drawer>
    </>
  )
}
