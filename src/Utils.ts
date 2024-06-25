export function roundTo(n: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(n * factor) / factor;
}
