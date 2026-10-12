import { InlineLoading, Loading } from '@carbon/react';

interface LoadingStateProps {
  description?: string;
  overlay?: boolean;
}

export function LoadingState({ description = 'Daten werden geladen...', overlay = false }: LoadingStateProps) {
  if (overlay) {
    return <Loading description={description} withOverlay={true} />;
  }

  return (
    <div style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <InlineLoading description={description} status="active" />
    </div>
  );
}
