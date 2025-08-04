// src/plugins/mathPlugin.ts
// Evaluates simple math expressions in the user query
import { Plugin } from './pluginInterface';

const MathPlugin: Plugin = {
  name: 'MathPlugin',
  description: 'Evaluates math expressions like "2 + 2 * 5" if query starts with "math:"',
  canHandle(query: string) {
    return query.trim().toLowerCase().startsWith('math:');
  },
  async handle(query: string) {
    try {
      const expr = query.replace(/^math:/i, '').trim();
      // Evaluate safely (no variables, only numbers and operators)
      if (!/^[-+*/().\d\s]+$/.test(expr)) throw new Error('Invalid characters');
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      return `Result: ${result}`;
    } catch (e) {
      return 'Invalid math expression.';
    }
  },
};

export default MathPlugin;
