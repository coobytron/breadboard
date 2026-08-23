import type { LeveledText } from '../types';

export function stackVoltage(cellVolts: number, count: number): number {
  return cellVolts * Math.max(0, count);
}

export function canLightLed(totalVolts: number, ledForwardVolts: number): boolean {
  return totalVolts >= ledForwardVolts;
}

export function cellsNeeded(cellVolts: number, ledForwardVolts: number): number {
  if (ledForwardVolts <= 0) return 0;
  if (cellVolts <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil(ledForwardVolts / cellVolts);
}

export function explainWhyDim(
  cellVolts: number,
  count: number,
  ledForwardVolts: number,
): LeveledText {
  const total = stackVoltage(cellVolts, count);
  const clearsForwardVoltage = canLightLed(total, ledForwardVolts);

  if (!clearsForwardVoltage) {
    return {
      explorer: `These ${count} lemon ${count === 1 ? 'battery is' : 'batteries are'} not strong enough yet. Add more lemons. Even when it works, the light will only be a tiny glow in a dark room.`,
      builder: `${total.toFixed(1)}V is below the LED's ${ledForwardVolts.toFixed(1)}V turn-on voltage. Add cells in series. Fruit cells also have lots of internal resistance, so the LED will still be very faint.`,
      engineer: `${total.toFixed(2)}V does not clear the LED's roughly ${ledForwardVolts.toFixed(2)}V forward voltage. More series cells raise voltage, but fruit-cell internal resistance is typically in the kilohms, limiting current to microamps rather than LED-scale milliamps.`,
    };
  }

  return {
    explorer: 'There is enough push now, but lemons are weak batteries. Look in a dark room for a tiny, faint glow.',
    builder: `${total.toFixed(1)}V clears the LED voltage, but fruit batteries have high internal resistance. They can only supply a tiny current, so expect a faint glow in a dark room. Four cells gives a more reliable margin than the bare minimum.`,
    engineer: `${total.toFixed(2)}V clears the forward-voltage threshold, but that is only the voltage condition. Kilohms of internal resistance limit the series stack to microamps, far below the milliamps used by a normal LED circuit, so any glow will be faint and easiest to see in a dark room.`,
  };
}
