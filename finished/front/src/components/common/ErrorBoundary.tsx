import { Component, type ReactNode, type ErrorInfo } from 'react';
import { InlineNotification, Button, Stack } from '@carbon/react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem' }}>
          <Stack gap={5}>
            <InlineNotification
              kind="error"
              title={this.props.fallbackTitle ?? 'Ein unerwarteter Fehler ist aufgetreten'}
              subtitle={this.state.error?.message || 'Bitte versuchen Sie es erneut oder wenden Sie sich an die Stadtverwaltung.'}
              lowContrast
              hideCloseButton
            />
            <div>
              <Button size="sm" kind="tertiary" onClick={this.handleReset}>
                Erneut versuchen
              </Button>
            </div>
          </Stack>
        </div>
      );
    }

    return this.props.children;
  }
}
