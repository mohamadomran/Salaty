/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, useTheme, Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

class ErrorBoundaryInternal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log error to service (optional)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: any) => {
    // In a real app, you would send this to a logging service
    // For now, just log to console with more details
    console.group('🚨 Error Boundary - Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    // In React Native, we can't easily reload the entire app
    // But we can reset the error state and let user retry
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// Functional wrapper to use hooks
function ErrorBoundary({ children, fallback }: Props) {
  return (
    <ErrorBoundaryInternal fallback={fallback}>
      {children}
    </ErrorBoundaryInternal>
  );
}

// Error fallback component
function ErrorFallback({
  error,
  onRetry,
  onReload,
}: {
  error?: Error;
  onRetry: () => void;
  onReload: () => void;
}) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Card style={styles.errorCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={64}
                color={theme.colors.error}
              />
            </View>

            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.error }]}
            >
              Oops! Something went wrong
            </Text>

            <Text
              variant="bodyMedium"
              style={[styles.message, { color: theme.colors.onSurface }]}
            >
              An unexpected error occurred. Please try again or restart the app
              if the problem persists.
            </Text>

            {__DEV__ && error && (
              <View style={styles.errorDetails}>
                <Text
                  variant="labelMedium"
                  style={[styles.errorLabel, { color: theme.colors.error }]}
                >
                  Error Details (Development Mode):
                </Text>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.errorText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {error.toString()}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={onRetry}
                style={[
                  styles.button,
                  { backgroundColor: theme.colors.primary },
                ]}
                contentStyle={styles.buttonContent}
              >
                Try Again
              </Button>

              <Button
                mode="outlined"
                onPress={onReload}
                style={[styles.button, { borderColor: theme.colors.outline }]}
                contentStyle={styles.buttonContent}
              >
                Reload Screen
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
  },
  cardContent: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorLabel: {
    marginBottom: 4,
    fontWeight: '600',
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ErrorBoundary;
