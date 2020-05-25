import * as React from 'react';
import { Component } from 'react';
import logError from '../shim/logging/logError';

interface Props {
  readonly children: React.ReactNode;
}

class ErrorBoundary extends Component<Props> {
  static getDerivedStateFromError(error: Error) {
    logError(error);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
