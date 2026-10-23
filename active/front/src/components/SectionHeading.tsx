import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

interface SectionHeadingProps {
  children: React.ReactNode
  /** Whether to render a divider below the heading. Defaults to true. */
  divider?: boolean
}

/** Blue section heading matching the portal design language. */
export function SectionHeading({ children, divider = true }: SectionHeadingProps) {
  return (
    <>
      <Typography variant="h5" component="h2" color="primary" sx={{ mb: divider ? 0 : 1 }}>
        {children}
      </Typography>
      {divider && <Divider sx={{ mb: 2, borderColor: 'primary.main', borderWidth: 2 }} />}
    </>
  )
}
