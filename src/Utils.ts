export function roundTo(n: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(n * factor) / factor;
}

export function formatSpaceChange(
	spaceSavedInKb: number,
	spaceSavedPercentage: number
): string {
	const change = spaceSavedInKb >= 0 ? "saved" : "increased";
	return `Space ${change}: ${Math.abs(spaceSavedInKb)} KB (${Math.abs(
		spaceSavedPercentage
	)}%)`;
}
