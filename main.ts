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

const DEFAULT_SETTINGS: ImageConverterPluginSettings = {
	cwebpPath: "cwebp",
	convertPath: "convert",
	defaultTargetImageFormat: Format.Webp,
};

export default class ImageConverterPlugin extends Plugin {
	settings: ImageConverterPluginSettings;

	async onload() {
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
					item.setTitle("Convert Image")
						.setIcon("image-off")
						.onClick(async () =>
							this.convertImageAndReplace(fPath, source)
						);
				});
			})
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async convertImageAndReplace(
		filePath: string,
		source: string
	): Promise<void> {
		const format = this.settings.defaultTargetImageFormat;
		try {
			const converter = new ImageConverter(this.settings, format);
			await converter.convert(this.getAbsoluteFilePath(filePath));
			new Notice("Image converted!");
		} catch (e) {
			new Notice(`Error converting image: ${e}`);
			throw e;
		}
		console.log(`SOURCE: ${source}`);
		if (source === "link-context-menu") {
			const editor =
				this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
			if (!editor) return;
			new Notice("Updating image path...");
			const lineNumber = editor.getCursor().line;
			const line = editor.getLine(lineNumber);
			const imageFileName = path.basename(filePath);
			const imageFileNameWithoutExtension = imageFileName.substring(
				0,
				imageFileName.lastIndexOf(".")
			);
			console.log(
				`Replacing ${imageFileName} with ${imageFileNameWithoutExtension}.${format} on ${line}`
			);
			const newLine = line.replace(
				imageFileName,
				`${imageFileNameWithoutExtension}.${format}`
			);
			editor.setLine(lineNumber, newLine);
		}
	}

	private isImageFile(filePath: string): boolean {
		const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
		return imageExtensions.some((extension) =>
			filePath.endsWith(extension)
		);
	}

	private extensionIsCurrentFormat(filePath: string): boolean {
		const extension = path.extname(filePath);
		const currentFormat = this.settings.defaultTargetImageFormat;
		return extension === `.${currentFormat}`;
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
	plugin: ImageConverterPlugin;

	constructor(app: App, plugin: ImageConverterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Default Targer Image Format")
			.setDesc("Default image format to convert to")
			.addDropdown((dropdown) => {
				dropdown.addOption("webp", "WebP");
				dropdown.addOption("png", "PNG");
				dropdown.addOption("jpg", "JPEG");
				dropdown.addOption("gif", "GIF");
				dropdown
					.setValue(this.plugin.settings.defaultTargetImageFormat)
					.onChange(async (value) => {
						this.plugin.settings.defaultTargetImageFormat =
							value as Format;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("cwebp Path")
			.setDesc("Path to cwebp binary")
			.addText((text) =>
				text
					.setPlaceholder("cwebp")
					.setValue(this.plugin.settings.cwebpPath)
					.onChange(async (value) => {
						this.plugin.settings.cwebpPath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
