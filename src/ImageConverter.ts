import { WebpConverter } from "./WebpConverter";
import { ImageConverterPluginSettings } from "./ImageConverterPluginSettings";
import { ImageMagickConverter } from "./ImageMagickConverter";
import { Converter } from "./Converter";

export class ImageConverter {
	converter: Converter;

	constructor(settings: ImageConverterPluginSettings, target: Format) {
		switch (target) {
			case Format.Webp:
				this.converter = new WebpConverter(settings.cwebpPath);
				break;
			case Format.Avif:
			case Format.Gif:
			case Format.Jpeg:
			case Format.Png:
				this.converter = new ImageMagickConverter(
					settings.convertPath,
					target
				);
				break;
			default:
				throw new Error(`No converter found for ${target}`);
		}
	}

	/**
	 * Convert an image file to a the specific image format
	 * @param filePath Path to the image file to convert as absolute path
	 */
	convert(filePath: string): Promise<void> {
		return this.converter.convert(filePath);
	}
}

export enum Format {
	Webp = "webp",
	Jpeg = "jpeg",
	Png = "png",
	Gif = "gif",
	Avif = "avif",
}
