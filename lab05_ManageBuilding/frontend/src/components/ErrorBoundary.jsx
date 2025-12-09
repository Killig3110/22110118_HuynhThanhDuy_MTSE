import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // TODO: Send error to monitoring service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        // Optionally reload the page if error persists
        if (this.state.errorCount > 2) {
            window.location.reload();
        }
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-2xl w-full">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            {/* Error Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-red-100 rounded-full p-4">
                                    <AlertTriangle className="h-12 w-12 text-red-600" />
                                </div>
                            </div>

                            {/* Error Message */}
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Oops! Something went wrong
                                </h1>
                                <p className="text-gray-600">
                                    We're sorry for the inconvenience. An unexpected error has occurred.
                                </p>
                            </div>

                            {/* Error Details (Development Only) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-6 bg-gray-100 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                        Error Details:
                                    </h3>
                                    <div className="text-sm text-gray-700 mb-2">
                                        <strong>Message:</strong> {this.state.error.toString()}
                                    </div>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-gray-600">
                                            <summary className="cursor-pointer hover:text-gray-900 mb-2">
                                                Stack Trace
                                            </summary>
                                            <pre className="whitespace-pre-wrap bg-white p-3 rounded border border-gray-300 overflow-auto max-h-64">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={this.handleReset}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <RefreshCw className="h-5 w-5" />
                                    Try Again
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <Home className="h-5 w-5" />
                                    Go Home
                                </button>
                            </div>

                            {/* Helpful Tips */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    What you can do:
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Refresh the page or try again</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Clear your browser cache and cookies</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Check your internet connection</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Contact support if the problem persists</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Error Count Warning */}
                            {this.state.errorCount > 1 && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Multiple errors detected ({this.state.errorCount}).
                                        {this.state.errorCount > 2 && ' The page will reload automatically on next retry.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
