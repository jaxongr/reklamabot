import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Result, Button } from 'antd'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Xatolik yuz berdi"
          subTitle={this.state.error?.message || 'Kutilmagan xatolik'}
          extra={[
            <Button type="primary" key="retry" onClick={this.handleReset}>
              Qayta urinish
            </Button>,
            <Button key="home" onClick={() => (window.location.href = '/dashboard')}>
              Bosh sahifaga
            </Button>,
          ]}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
