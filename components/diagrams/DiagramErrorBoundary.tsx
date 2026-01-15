"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DiagramErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Failed to render diagram
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {this.state.error?.message}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
