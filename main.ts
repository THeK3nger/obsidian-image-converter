import {
	App,
	FileSystemAdapter,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import * as path from "path";
import { ImageConverterPluginSettings } from "src/ImageConverterPluginSettings";
import { Format, ImageConverter } from "src/ImageConverter";
import { formatSpaceChange, roundTo } from "src/Utils";
import { replaceImageLinkExtensionAtCursor } from "src/MarkdownLinks";

const IMAGE_FORMATS: readonly Format[] = [
	Format.Jpeg,
	Format.Jpg,
	Format.Png,
	Format.Gif,
	Format.Webp,
	Format.Avif,
];

const TARGET_IMAGE_FORMATS: readonly Format[] = [
	Format.Jpeg,
	Format.Png,
	Format.Gif,
	Format.Webp,
	Format.Avif,
];

const DEFAULT_SETTINGS: ImageConverterPluginSettings = {
	convertPath: "convert",
	defaultTargetImageFormat: Format.Webp,
};

function isTargetImageFormat(value: unknown): value is Format {
	return (
		typeof value === "string" &&
		TARGET_IMAGE_FORMATS.includes(value as Format)
	);
}

export default class ImageConverterPlugin extends Plugin {
	settings!: ImageConverterPluginSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new ImageConverterSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file, source) => {
				const fPath = file.path;
				if (
					!this.isImageFile(fPath) ||
					this.extensionIsCurrentFormat(fPath)
				)
					return;
				menu.addItem((item) => {
					item.setTitle("Convert image")
						.setIcon("image-off")
						.onClick(() => {
							void this.convertImageAndReplace(fPath, source).catch(
								(error: unknown) => {
									console.error("Unexpected image conversion error", error);
									const message =
										error instanceof Error ? error.message : String(error);
									new Notice(`Error converting image: ${message}`);
								}
							);
						});
				});
			})
		);
	}

	private async loadSettings(): Promise<void> {
		const loadedSettings =
			(await this.loadData()) as Partial<ImageConverterPluginSettings> | null;

		this.settings = {
			convertPath:
				typeof loadedSettings?.convertPath === "string" &&
				loadedSettings.convertPath.trim().length > 0
					? loadedSettings.convertPath
					: DEFAULT_SETTINGS.convertPath,
			defaultTargetImageFormat: isTargetImageFormat(
				loadedSettings?.defaultTargetImageFormat
			)
				? loadedSettings.defaultTargetImageFormat
				: DEFAULT_SETTINGS.defaultTargetImageFormat,
		};
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private async convertImageAndReplace(
		filePath: string,
		source: string
	): Promise<void> {
		const format = this.settings.defaultTargetImageFormat;
		let spaceSavedInKb: number;
		let spaceSavedPercentage: number;

		try {
			const converter = new ImageConverter(this.settings, format);
			const fullPath = this.getAbsoluteFilePath(filePath);
			await converter.convert(fullPath);
			spaceSavedInKb = roundTo(converter.getSpaceSaved(fullPath) / 1024, 2);
			spaceSavedPercentage = roundTo(
				converter.getSpaceSavedPercentage(fullPath),
				2
			);
		} catch (error: unknown) {
			console.error("Image conversion failed", error);
			const message = error instanceof Error ? error.message : String(error);
			new Notice(`Error converting image: ${message}`);
			return;
		}

		new Notice("Image converted!");
		new Notice(formatSpaceChange(spaceSavedInKb, spaceSavedPercentage));

		if (source !== "link-context-menu") return;

		const editor =
			this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) {
			new Notice("Image converted, but the active link could not be updated.");
			return;
		}

		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
		const updatedLine = replaceImageLinkExtensionAtCursor(
			line,
			cursor.ch,
			filePath,
			format
		);
		if (updatedLine === null) {
			new Notice("Image converted, but the active link could not be updated.");
			return;
		}

		editor.setLine(cursor.line, updatedLine);
	}

	private isImageFile(filePath: string): boolean {
		const extension = path.extname(filePath).slice(1).toLowerCase();
		return IMAGE_FORMATS.includes(extension as Format);
	}

	private extensionIsCurrentFormat(filePath: string): boolean {
		const extension = path.extname(filePath).slice(1).toLowerCase();
		return extension === this.settings.defaultTargetImageFormat;
	}

	private getVaultAbsolutePath(): string {
		const adapter = this.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter) {
			return adapter.getBasePath();
		}
		throw new Error("Unsupported adapter");
	}

	private getAbsoluteFilePath(filePath: string): string {
		const vaultPath = this.getVaultAbsolutePath();
		return path.join(vaultPath, filePath);
	}
}

class ImageConverterSettingTab extends PluginSettingTab {
	private readonly plugin: ImageConverterPlugin;

	constructor(app: App, plugin: ImageConverterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Default target image format")
			.setDesc("Default image format to convert to")
			.addDropdown((dropdown) => {
				TARGET_IMAGE_FORMATS.forEach((format) => {
					dropdown.addOption(format, format.toUpperCase());
				});
				dropdown
					.setValue(this.plugin.settings.defaultTargetImageFormat)
					.onChange(async (value) => {
						if (!isTargetImageFormat(value)) return;
						this.plugin.settings.defaultTargetImageFormat = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Convert path")
			.setDesc("Path to the ImageMagick convert binary")
			.addText((text) =>
				text
					.setPlaceholder("convert")
					.setValue(this.plugin.settings.convertPath)
					.onChange(async (value) => {
						this.plugin.settings.convertPath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
