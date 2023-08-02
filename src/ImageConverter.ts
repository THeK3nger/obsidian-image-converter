import { ImageConverterPluginSettings } from "./ImageConverterPluginSettings";
import { ImageMagickConverter } from "./ImageMagickConverter";
import { Converter } from "./Converter";
import { FileStats } from "./FileStats";
import * as path from "path";

export class ImageConverter {
	converter: Converter;

	constructor(
		settings: ImageConverterPluginSettings,
		private readonly target: Format
	) {
		// This looks useless, but it is there to make sure that
		// we can extend the plugin with something other than ImageMagick
		// if we need to.
		switch (target) {
			case Format.Webp:
			case Format.Avif:
			case Format.Gif:
			case Format.Jpeg:
			case Format.Png:
				this.converter = new ImageMagickConverter(settings.convertPath);
				break;
			default:
				throw new Error(`No converter found for ${target}`);
		}
	}

	/**
	 * Convert an image file to a the specific image format
	 * @param filePath Path to the image file to convert as absolute path
	 */
	async convert(filePath: string): Promise<void> {
		return this.converter.convert(filePath, this.getOutputPath(filePath));
	}

	getSpaceSaved(filePath: string): number {
		const originalSize = FileStats.getSize(filePath);
		const convertedSize = FileStats.getSize(this.getOutputPath(filePath));
		return originalSize - convertedSize;
	}

	getSpaceSavedPercentage(filePath: string): number {
		const originalSize = FileStats.getSize(filePath);
		const convertedSize = FileStats.getSize(this.getOutputPath(filePath));
		return (1 - convertedSize / originalSize) * 100;
	}

	private getOutputPath(filePath: string): string {
		// Get the name of the file without the extension
		const baseName = path.basename(filePath, path.extname(filePath));
		// Replace the extension with the target format
		return path.join(path.dirname(filePath), `${baseName}.${this.target}`);
	}
}

export enum Format {
	Webp = "webp",
	Jpeg = "jpeg",
	Jpg = "jpg",
	Png = "png",
	Gif = "gif",
	Avif = "avif",
}
