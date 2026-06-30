import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-space-bg flex items-center justify-center px-4">
          <div className="glass glass-glow-orange rounded-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-red/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-accent-red" />
            </div>
            <h1 className="text-2xl font-mono font-bold text-white mb-3">Something Went Wrong</h1>
            <p className="text-gray-400 mb-6 font-body">
              An unexpected error occurred. Try reloading the page.
            </p>
            <button onClick={this.handleReload} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
