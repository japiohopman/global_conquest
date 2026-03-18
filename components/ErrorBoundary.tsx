import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { errorHandler, GameError, ErrorCodes } from '../services/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="fixed inset-0 z-[600] bg-red-950/90 backdrop-blur-3xl flex items-center justify-center p-8">
    <div className="w-full max-w-md bg-zinc-900 border border-red-500/30 p-8 rounded-[2rem] shadow-[0_0_100px_rgba(239,68,68,0.2)] text-center">
      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl bangers text-white mb-4">SYSTEM ERROR</h2>
      <p className="text-zinc-300 text-sm mb-4">{error.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white bangers rounded-xl transition-all"
      >
        RESTART SYSTEM
      </button>
    </div>
  </div>
);

export class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const gameError = new GameError(
      'App component error',
      ErrorCodes.GAME_STATE_ERROR,
      { errorInfo, componentStack: errorInfo.componentStack }
    );
    errorHandler.logError(gameError);
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}
