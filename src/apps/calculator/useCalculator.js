import { useState, useCallback } from 'react'

export function useCalculator() {
  const [displayValue, setDisplayValue] = useState('0')
  const [previousValue, setPreviousValue] = useState(null)
  const [pendingOperation, setPendingOperation] = useState(null)
  const [waitingForNextOperand, setWaitingForNextOperand] = useState(false)

  const inputDigit = useCallback(
    (digit) => {
      if (waitingForNextOperand) {
        setDisplayValue(String(digit))
        setWaitingForNextOperand(false)
      } else {
        setDisplayValue((prev) => (prev === '0' ? String(digit) : prev + digit))
      }
    },
    [waitingForNextOperand]
  )

  const inputDecimal = useCallback(() => {
    if (waitingForNextOperand) {
      setDisplayValue('0.')
      setWaitingForNextOperand(false)
      return
    }
    if (!displayValue.includes('.')) {
      setDisplayValue((prev) => prev + '.')
    }
  }, [waitingForNextOperand, displayValue])

  const clear = useCallback(() => {
    setDisplayValue('0')
    setPreviousValue(null)
    setPendingOperation(null)
    setWaitingForNextOperand(false)
  }, [])

  const executeCalculation = (firstVal, secondVal, operation) => {
    switch (operation) {
      case '+':
        return firstVal + secondVal
      case '-':
        return firstVal - secondVal
      case '*':
        return firstVal * secondVal
      case '/':
        return secondVal === 0 ? 0 : firstVal / secondVal
      default:
        return secondVal
    }
  }

  const applyOperator = useCallback(
    (nextOperator) => {
      const inputValue = parseFloat(displayValue)

      if (previousValue === null) {
        setPreviousValue(inputValue)
      } else if (pendingOperation) {
        const current = previousValue || 0
        const result = executeCalculation(current, inputValue, pendingOperation)
        setPreviousValue(result)
        setDisplayValue(String(result))
      }

      setWaitingForNextOperand(true)
      setPendingOperation(nextOperator)
    },
    [displayValue, previousValue, pendingOperation]
  )

  const calculateResult = useCallback(() => {
    const inputValue = parseFloat(displayValue)

    if (previousValue !== null && pendingOperation) {
      const result = executeCalculation(previousValue, inputValue, pendingOperation)
      setDisplayValue(String(result))
      setPreviousValue(null)
      setPendingOperation(null)
      setWaitingForNextOperand(true)
    }
  }, [displayValue, previousValue, pendingOperation])

  const toggleSign = useCallback(() => {
    setDisplayValue((prev) => String(-parseFloat(prev)))
  }, [])

  return {
    displayValue,
    inputDigit,
    inputDecimal,
    clear,
    applyOperator,
    calculateResult,
    toggleSign,
  }
}
