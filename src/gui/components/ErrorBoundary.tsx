import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 p-4 rounded-lg">
          <h2 className="text-red-500 font-bold mb-2">Something went wrong</h2>
          <p className="text-red-400 text-sm">{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
