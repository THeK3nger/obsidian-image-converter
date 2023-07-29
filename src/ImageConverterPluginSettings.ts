import { Format } from "./ImageConverter";

export interface ImageConverterPluginSettings {
	cwebpPath: string;
	convertPath: string;
	defaultTargetImageFormat: Format;
}
