const DIGIT_COLORS = [
  'black',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'violet',
  'grey',
  'white',
] as const;

export function bandsFor(ohms: number): string[] {
  if (!Number.isFinite(ohms) || ohms < 10) {
    throw new Error('Three-band resistor values must be at least 10 ohms.');
  }

  const exponent = Math.max(0, Math.floor(Math.log10(ohms)) - 1);
  const significant = Math.round(ohms / 10 ** exponent);
  const first = Math.floor(significant / 10);
  const second = significant % 10;

  if (first > 9 || second > 9 || exponent > 9) {
    throw new Error('Resistor value cannot be represented with a three-band colour code.');
  }

  return [DIGIT_COLORS[first], DIGIT_COLORS[second], DIGIT_COLORS[exponent]];
}
