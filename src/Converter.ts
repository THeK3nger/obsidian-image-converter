export interface Converter {
	convert(filePath: string, outputPath: string): Promise<void>;
}
