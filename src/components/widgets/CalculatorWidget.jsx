import { useState } from 'react'
import { soundService } from '../../services/soundService.js'

export default function CalculatorWidget() {
  const [display, setDisplay] = useState('0')
  const [prevVal, setPrevVal] = useState(null)
  const [operator, setOperator] = useState(null)
  const [clearOnNext, setClearOnNext] = useState(false)

  const handleDigit = (digit) => {
    soundService.playClick()
    if (display === '0' || clearOnNext) {
      setDisplay(digit)
      setClearOnNext(false)
    } else {
      setDisplay(display + digit)
    }
  }

  const handleOp = (op) => {
    soundService.playClick()
    setPrevVal(parseFloat(display))
    setOperator(op)
    setClearOnNext(true)
  }

  const handleEqual = () => {
    soundService.playClick()
    if (prevVal === null || !operator) return
    const current = parseFloat(display)
    let res = 0
    if (operator === '+') res = prevVal + current
    if (operator === '-') res = prevVal - current
    if (operator === '×') res = prevVal * current
    if (operator === '÷') res = current !== 0 ? prevVal / current : 'Error'

    setDisplay(String(res).slice(0, 8))
    setPrevVal(null)
    setOperator(null)
    setClearOnNext(true)
  }

  const handleClear = () => {
    soundService.playClick()
    setDisplay('0')
    setPrevVal(null)
    setOperator(null)
    setClearOnNext(false)
  }

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['C', '0', '=', '+'],
  ]

  return (
    <div className="flex flex-col justify-between h-full gap-1.5 font-mono">
      {/* LCD Screen */}
      <div className="border border-[var(--os-border)] bg-[var(--os-bg)] p-1 text-right font-black text-sm tracking-wider truncate shadow-[inset_1px_1px_0px_var(--os-border)]">
        {display}
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-1 flex-1">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            type="button"
            onClick={() => {
              if (btn === 'C') handleClear()
              else if (btn === '=') handleEqual()
              else if (['+', '-', '×', '÷'].includes(btn)) handleOp(btn)
              else handleDigit(btn)
            }}
            className="border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] font-bold text-xs flex items-center justify-center p-1 cursor-pointer"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  )
}
