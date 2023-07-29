export interface Converter {
	convert(filePath: string): Promise<void>;
}
