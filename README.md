# Obsidian Image Converter

This is a plugin to convert images in your vault from one format to another using ImageMagick.

![Example](https://github.com/THeK3nger/obsidian-image-converter/assets/133159/6ab8b248-4def-4add-898a-6d6c8f7345fb)

## Pre-requisites

Install ImageMagik on your system.

### macOS

On macOS, you can use [Homebrew](https://brew.sh/):

```bash
brew install imagemagick
```

### Windows

On Windows, you can use [Chocolatey](https://chocolatey.org/):

```bash
choco install imagemagick
```

### Linux

On Linux, you can use your package manager. For example, on Ubuntu:

```bash
sudo apt install imagemagick
```

## Manual Installation

To install this plugin manually:

1. Go to Releases and download the latest release.
2. Extract the zip to your vault's plugins folder: `<vault>/.obsidian/plugins/`.
3. Activate the plugin in Settings.

If you want the most recent release:

1. Clone this repo to your vault's plugins folder: `<vault>/.obsidian/plugins/`.
2. Run `npm i` in the cloned folder.
3. Run `npm run build` in the cloned folder.
4. Activate the plugin in Settings.

## Usage

First of all, go in the plugin's settings and configure the path to the `convert` command. On macOS, this is usually `/usr/local/bin/convert`. On Windows, this is usually `C:\Program Files\ImageMagick-7.0.10-Q16-HDRI\convert.exe`. On Linux, this is usually `/usr/bin/convert`. Then, select the desired target format. The default is `webp`.

If everything is configured correctly, when you right click on an image in the file explorer or in a markdown file link, you should see a new option in the context menu: "Convert Image." This command will convert the image to the selected format and update the link in the markdown file.

## Notes

-   This plugin only works on desktop. No mobile support for now.
-   At the moment, the plugin only replace the link you clicked on. If you have multiple links to the same image, you will have to update them by hand. Global substitution will be implemented in a future release (hopefully).
-   The plugin will not delete the original image for safety reasons. You will have to delete it by hand if you want to. Or, you can use the [Obsidian Nuke Orphans](https://github.com/sandorex/nuke-orphans-plugin) plugin.
