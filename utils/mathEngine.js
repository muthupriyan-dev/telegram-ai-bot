// utils/mathEngine.js
// Detects arithmetic and computes it exactly — LLMs pattern-match multiplication
// instead of actually calculating, which is why 987 * 654 came out wrong.
// No external library needed; a tiny safe evaluator is enough for +- * / ^ % ().

const MATH_TRIGGER = /\d+\s*[\+\-\*x×÷\/\^%]\s*\d+/i;
const SAFE_CHARS = /^[\d\s\+\-\*\/\^%\.\(\)]+$/;

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/what('?s| is)|calculate|equals?|=\s*\?*$/g, '')
    .replace(/x|×/g, '*')
    .replace(/÷/g, '/')
    .trim();
}

// Minimal safe recursive-descent evaluator (no eval(), no Function()).
function evaluateExpr(expr) {
  let i = 0;
  const skip = () => { while (expr[i] === ' ') i++; };

  function parseExpr() {
    let value = parseTerm();
    skip();
    while (expr[i] === '+' || expr[i] === '-') {
      const op = expr[i++];
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
      skip();
    }
    return value;
  }
  function parseTerm() {
    let value = parseFactor();
    skip();
    while (expr[i] === '*' || expr[i] === '/' || expr[i] === '%') {
      const op = expr[i++];
      const rhs = parseFactor();
      value = op === '*' ? value * rhs : op === '/' ? value / rhs : value % rhs;
      skip();
    }
    return value;
  }
  function parseFactor() {
    skip();
    let base;
    if (expr[i] === '(') {
      i++;
      base = parseExpr();
      skip();
      if (expr[i] === ')') i++;
    } else if (expr[i] === '-') {
      i++;
      base = -parseFactor();
    } else {
      const start = i;
      while (/[\d.]/.test(expr[i])) i++;
      base = parseFloat(expr.slice(start, i));
    }
    skip();
    if (expr[i] === '^') {
      i++;
      base = Math.pow(base, parseFactor());
    }
    return base;
  }

  const result = parseExpr();
  if (isNaN(result)) throw new Error('Invalid expression');
  return result;
}

function isMathExpression(text) {
  return MATH_TRIGGER.test(text);
}

function tryCalculate(text) {
  if (!isMathExpression(text)) return null;
  const expr = normalize(text);
  const match = expr.match(/[\d\s\+\-\*\/\^%\.\(\)]+/);
  if (!match) return null;
  const clean = match[0].trim();
  if (!SAFE_CHARS.test(clean) || !/\d/.test(clean)) return null;

  try {
    const result = evaluateExpr(clean);
    if (typeof result !== 'number' || !isFinite(result)) return null;
    const formatted = Number.isInteger(result) ? result : Number(result.toFixed(6));
    return { expression: clean.replace(/\s+/g, ' '), result: formatted };
  } catch {
    return null; // not valid math — let the LLM handle it as normal conversation
  }
}

module.exports = { isMathExpression, tryCalculate };
