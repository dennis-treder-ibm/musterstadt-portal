import { InlineNotification, Button, Stack } from '@carbon/react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export function ErrorState({
  title = 'Fehler beim Laden',
  message,
  onRetry,
  onClose,
}: ErrorStateProps) {
  return (
    <Stack gap={4} style={{ margin: '1rem 0' }}>
      <InlineNotification
        kind="error"
        title={title}
        subtitle={message}
        lowContrast
        onCloseButtonClick={onClose}
        hideCloseButton={!onClose}
      />
      {onRetry && (
        <div>
          <Button size="sm" kind="tertiary" onClick={onRetry}>
            Erneut versuchen
          </Button>
        </div>
      )}
    </Stack>
  );
}
