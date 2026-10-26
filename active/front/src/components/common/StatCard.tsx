import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

interface StatCardProps {
  label: string
  value: number
  /** Theme palette color used for the number; omit for the default text color. */
  color?: 'warning.main' | 'success.main' | 'error.main'
}

/** Single dashboard figure (legacy "Übersicht: Aktuelle Zahlen"). */
export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h3" component="p" sx={{ color: color ?? 'text.primary', fontWeight: 600 }}>
          {value}
        </Typography>
        <Typography color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  )
}
