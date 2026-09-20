import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl m-4 text-rose-900 dark:text-rose-200">
          <h2 className="text-base font-bold mb-2 flex items-center gap-2">
            ⚠️ Rendering Error in Component
          </h2>
          <p className="text-xs font-mono bg-rose-100 dark:bg-rose-900/60 p-3 rounded mb-3 overflow-x-auto">
            {this.state.error?.toString()}
          </p>
          {this.state.errorInfo?.componentStack && (
            <pre className="text-[10px] font-mono opacity-80 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('awardhub_v1_state');
                window.location.reload();
              }}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold"
            >
              Clear Storage Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
