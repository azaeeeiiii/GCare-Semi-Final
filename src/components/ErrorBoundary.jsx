// Catches render errors so one broken page shows a message instead of a blank white screen.

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Something went wrong</h1>
        <p>This page ran into a problem. Please try again.</p>
        <p>
          <a href="/feed">Back to Feed</a> · <a href="/">Home</a>
        </p>
      </div>
    );
  }
}