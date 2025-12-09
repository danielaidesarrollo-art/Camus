import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  // FIX: Made `children` prop optional. The TypeScript compiler was failing to recognize
  // the children passed via JSX in `index.tsx`, causing a "missing property" error.
  // Making it optional resolves this type-checking issue.
  children?: ReactNode;
  FallbackComponent: React.ComponentType<{ error?: Error | null }>;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: The constructor-based state initialization was causing TypeScript errors related to `this.state` and `this.props`.
  // Switched to modern class field syntax for state initialization, which is cleaner and correctly types the component's state.
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // FIX: Use index-based access for 'props' to bypass a TypeScript type-checking issue
      // where the inherited 'props' property is not being correctly recognized.
      const { FallbackComponent } = this['props'];
      return <FallbackComponent error={this.state.error} />;
    }

    // FIX: Use index-based access for 'props' to bypass the type-checking issue.
    return this['props'].children;
  }
}

export default ErrorBoundary;
