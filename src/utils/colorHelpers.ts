export function convertColorDecimalToHexString(colorDecimal: number): string {
	return colorDecimal == null
		? '#000000'
		: `#${colorDecimal.toString(16).padStart(6, '0')}`;
}

export function convertColorHexStringToDecimal(colorHex: string): number {
	return null != colorHex && colorHex.startsWith('#')
		? parseInt(colorHex.replace('#', ''), 16)
		: 0;
}
