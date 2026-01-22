import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AppButton } from './ui'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
      console.error('Application error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">⚠️</div>
            <h1 className="error-boundary__title">משהו השתבש</h1>
            <p className="error-boundary__message">
              מצטערים, אירעה שגיאה בלתי צפויה. אנא נסו לטעון מחדש את הדף.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="error-boundary__details">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            )}
            <div className="error-boundary__actions">
              <AppButton variant="primary" onClick={this.handleReload}>
                טען מחדש
              </AppButton>
              <AppButton variant="secondary" onClick={this.handleGoHome}>
                חזרה לדף הבית
              </AppButton>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
