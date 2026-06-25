import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unexpected UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas px-4 text-center">
          <p className="font-display text-lg font-semibold text-ink">Something went wrong</p>
          <p className="max-w-sm text-sm text-ink-muted">
            This screen hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas hover:bg-accent-soft"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
