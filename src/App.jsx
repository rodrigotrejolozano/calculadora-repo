import { useEffect, useState } from 'react';

const binaryOperations = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? null : a / b),
  '^': (a, b) => a ** b,
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return 'Error';
  return String(Number(value.toPrecision(12)));
};

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [pendingOperator, setPendingOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  const reset = () => {
    setDisplay('0');
    setPreviousValue(null);
    setPendingOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const inputDigit = (digit) => {
    if (display === 'Error' || waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    setDisplay(display === '0' ? digit : display + digit);
  };

  const inputDecimal = () => {
    if (display === 'Error' || waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const calculate = (first, second, operator) => {
    const result = binaryOperations[operator](first, second);
    return result === null || !Number.isFinite(result) ? null : result;
  };

  const chooseOperator = (operator) => {
    const inputValue = Number(display);
    if (Number.isNaN(inputValue)) return;

    if (pendingOperator && previousValue !== null && !waitingForOperand) {
      const result = calculate(previousValue, inputValue, pendingOperator);
      if (result === null) {
        setDisplay('Error');
        setExpression('Operación no válida');
        setPreviousValue(null);
        setPendingOperator(null);
        return;
      }
      setDisplay(formatNumber(result));
      setPreviousValue(result);
      setExpression(`${formatNumber(result)} ${operator}`);
    } else {
      setPreviousValue(inputValue);
      setExpression(`${formatNumber(inputValue)} ${operator}`);
    }
    setPendingOperator(operator);
    setWaitingForOperand(true);
  };

  const evaluate = () => {
    if (pendingOperator === null || previousValue === null || waitingForOperand) return;
    const result = calculate(previousValue, Number(display), pendingOperator);
    if (result === null) {
      setDisplay('Error');
      setExpression('Operación no válida');
    } else {
      setExpression(`${formatNumber(previousValue)} ${pendingOperator} ${display} =`);
      setDisplay(formatNumber(result));
    }
    setPreviousValue(null);
    setPendingOperator(null);
    setWaitingForOperand(true);
  };

  const applyUnary = (operation, symbol) => {
    const value = Number(display);
    let result = value;

    if (operation === 'sqrt') {
      result = value < 0 ? null : Math.sqrt(value);
    } else if (operation === 'factorial') {
      if (!Number.isInteger(value) || value < 0 || value > 170) {
        result = null;
      } else {
        result = 1;
        for (let index = 2; index <= value; index += 1) result *= index;
      }
    }

    if (result === null || !Number.isFinite(result)) {
      setDisplay('Error');
      setExpression('Operación no válida');
      return;
    }
    setExpression(`${symbol}(${display})`);
    setDisplay(formatNumber(result));
    setWaitingForOperand(true);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (/\d/.test(event.key)) inputDigit(event.key);
      else if (event.key === '.') inputDecimal();
      else if (['+', '-', '*', '/', '^'].includes(event.key)) {
        chooseOperator(event.key === '-' ? '−' : event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key);
      } else if (event.key === 'Enter' || event.key === '=') evaluate();
      else if (event.key === 'Escape') reset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const buttons = [
    { label: 'C', action: reset, className: 'action' },
    { label: '√', action: () => applyUnary('sqrt', '√'), className: 'operator' },
    { label: 'xʸ', action: () => chooseOperator('^'), className: 'operator' },
    { label: '÷', action: () => chooseOperator('÷'), className: 'operator' },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', action: () => chooseOperator('×'), className: 'operator' },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '−', action: () => chooseOperator('−'), className: 'operator' },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', action: () => chooseOperator('+'), className: 'operator' },
    { label: '0', action: () => inputDigit('0'), className: 'zero' },
    { label: '.', action: inputDecimal },
    { label: 'n!', action: () => applyUnary('factorial', '!'), className: 'operator' },
    { label: '=', action: evaluate, className: 'equals' },
  ];

  return (
    <main className="page-shell">
      <section className="calculator" aria-label="Calculadora">
        <header className="calculator-header">
          <div>
            <p className="eyebrow">Herramienta matemática</p>
            <h1>Calculadora</h1>
          </div>
          <span className="status-dot" aria-label="Lista para usar" />
        </header>
        <div className="screen" aria-live="polite">
          <span className="expression">{expression || ' '}</span>
          <strong>{display}</strong>
        </div>
        <div className="keypad">
          {buttons.map((button) => (
            <button
              className={button.className || ''}
              key={button.label}
              onClick={button.action}
              type="button"
            >
              {button.label}
            </button>
          ))}
        </div>
        <p className="hint">También puedes usar tu teclado</p>
      </section>
    </main>
  );
}

export default App;
