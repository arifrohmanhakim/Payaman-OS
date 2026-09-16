import { useCalculator } from './useCalculator.js'
import Button from '../../components/ui/Button.jsx'

export default function CalcApp() {
  const {
    displayValue,
    inputDigit,
    inputDecimal,
    clear,
    applyOperator,
    calculateResult,
    toggleSign,
  } = useCalculator()

  const keypadButtons = [
    { label: 'C', onClick: clear },
    { label: '±', onClick: toggleSign },
    { label: '/', onClick: () => applyOperator('/') },
    { label: '*', onClick: () => applyOperator('*') },
    { label: '7', onClick: () => inputDigit(7) },
    { label: '8', onClick: () => inputDigit(8) },
    { label: '9', onClick: () => inputDigit(9) },
    { label: '-', onClick: () => applyOperator('-') },
    { label: '4', onClick: () => inputDigit(4) },
    { label: '5', onClick: () => inputDigit(5) },
    { label: '6', onClick: () => inputDigit(6) },
    { label: '+', onClick: () => applyOperator('+') },
    { label: '1', onClick: () => inputDigit(1) },
    { label: '2', onClick: () => inputDigit(2) },
    { label: '3', onClick: () => inputDigit(3) },
    { label: '=', onClick: calculateResult },
    { label: '0', onClick: () => inputDigit(0), isColSpan: true },
    { label: '.', onClick: inputDecimal },
  ]

  return (
    <div className="flex flex-col space-y-3 font-mono text-[var(--os-fg)]">
      <div className="border-2 border-[var(--os-border)] p-2 bg-[var(--os-bg)] text-right text-lg font-bold tracking-widest overflow-hidden">
        {displayValue}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {keypadButtons.map((btn, index) => (
          <Button
            key={`${btn.label}-${index}`}
            onClick={btn.onClick}
            className={`py-2 text-xs ${btn.isColSpan ? 'col-span-2' : ''}`}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
