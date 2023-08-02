import { ImageConverterPluginSettings } from "./ImageConverterPluginSettings";
import { ImageMagickConverter } from "./ImageMagickConverter";
import { Converter } from "./Converter";

export class ImageConverter {
	converter: Converter;

	constructor(settings: ImageConverterPluginSettings, target: Format) {
		// This looks useless, but it is there to make sure that
		// we can extend the plugin with something other than ImageMagick
		// if we need to.
		switch (target) {
			case Format.Webp:
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
	Jpg = "jpg",
	Png = "png",
	Gif = "gif",
	Avif = "avif",
}
