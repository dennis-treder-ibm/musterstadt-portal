import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: ReactNode
}

/** Page heading (h1) with optional intro text. */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom={Boolean(description)}>
        {title}
      </Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
    </Box>
  )
}
