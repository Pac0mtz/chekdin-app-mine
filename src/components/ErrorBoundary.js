import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {RF, RP, getScreenSize} from '../utils/dim';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null, errorInfo: null};
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({hasError: false, error: null, errorInfo: null});
  };

  handleRestart = () => {
    // Force app restart by clearing state and reloading
    this.setState({hasError: false, error: null, errorInfo: null});
    // You might want to add navigation logic here to go back to a safe screen
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restartButton}
                onPress={this.handleRestart}>
                <Text style={styles.restartButtonText}>Restart App</Text>
              </TouchableOpacity>
            </View>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                <Text style={styles.debugText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RP(20),
  },
  title: {
    fontSize: RF(24),
    fontWeight: 'bold',
    color: '#02676C',
    textAlign: 'center',
    marginBottom: RP(10),
  },
  message: {
    fontSize: RF(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: RP(30),
    lineHeight: RF(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: RP(20),
  },
  retryButton: {
    backgroundColor: '#60C0B1',
    paddingHorizontal: RP(20),
    paddingVertical: RP(12),
    borderRadius: RP(25),
    minWidth: RP(120),
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: RF(16),
    fontWeight: '600',
  },
  restartButton: {
    backgroundColor: '#02676C',
    paddingHorizontal: RP(20),
    paddingVertical: RP(12),
    borderRadius: RP(25),
    minWidth: RP(120),
    alignItems: 'center',
  },
  restartButtonText: {
    color: 'white',
    fontSize: RF(16),
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#f5f5f5',
    padding: RP(15),
    borderRadius: RP(10),
    marginTop: RP(20),
    width: '100%',
  },
  debugTitle: {
    fontSize: RF(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: RP(5),
  },
  debugText: {
    fontSize: RF(12),
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
