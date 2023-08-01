import { Format } from "./ImageConverter";

export interface ImageConverterPluginSettings {
	convertPath: string;
	defaultTargetImageFormat: Format;
}
