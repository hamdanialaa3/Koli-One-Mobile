/**
 * Global Error Boundary for Mobile App
 * Catches unhandled React errors and displays fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { logger } from '../../services/logger-service';
import { AlertCircle } from 'lucide-react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[ErrorBoundary] Caught error', error, {
      componentStack: errorInfo.componentStack
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AlertCircle size={64} color="#EF4444" />
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.subtitle}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                {this.state.error?.stack}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32
  },
  button: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
      default: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
    })
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  debugContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    maxHeight: 200,
    width: '100%'
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8
  },
  debugText: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: 'monospace'
  }
});
