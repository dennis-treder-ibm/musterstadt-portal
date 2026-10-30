import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

interface ServiceCardProps {
  title: string
  description: string
  to: string
  actionLabel: string
}

/** Quick-link card ("Schnellzugriff") that navigates to a service area. */
export function ServiceCard({ title, description, to, actionLabel }: ServiceCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </CardContent>
      <CardActions>
        <Button component={RouterLink} to={to} aria-label={`${actionLabel}: ${title}`}>
          {actionLabel}
        </Button>
      </CardActions>
    </Card>
  )
}
