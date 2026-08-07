import React from 'react';

type State = { error: Error | null };

// Catches render errors anywhere below it so one broken page shows a message
// instead of blanking the entire app to a white screen. Without this, an
// uncaught error during render (like a typo'd variable name) unmounts
// everything React has rendered, with no visible clue why.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Something went wrong on this page</h1>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 1.5 }}>
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
              style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
