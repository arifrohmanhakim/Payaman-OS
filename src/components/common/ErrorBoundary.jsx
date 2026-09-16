import { Component } from 'react'
import Button from '../ui/Button.jsx'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Menghindari eksposur stack trace ke pengguna akhir
  }

  handleReset = () => {
    this.setState({ hasError: false })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center font-mono space-y-3 bg-white h-full">
          <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-bold text-lg">
            *
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs">Kesalahan Sistem Terjadi</h4>
            <p className="text-[11px] text-neutral-600">
              Aplikasi mengalami kendala internal dan ditangguhkan secara aman.
            </p>
          </div>
          <Button variant="default" onClick={handleReset}>
            Muat Ulang Aplikasi
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
