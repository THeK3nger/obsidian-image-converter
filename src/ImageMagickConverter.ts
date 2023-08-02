import * as path from "path";
import * as cp from "child_process";

import { Converter } from "./Converter";

export class ImageMagickConverter implements Converter {
	constructor(private binaryPath: string) {}

	convert(inputPath: string, outputPath: string): Promise<void> {
		console.log(`Converting ${inputPath} to ${outputPath}`);
		const baseDir = path.dirname(inputPath);
		const outputName = path.basename(outputPath);
		const fileName = path.basename(inputPath);
		console.log(this.binaryPath, fileName, outputName, baseDir);

		return new Promise<void>((resolve, reject) => {
			const spawned = cp.spawn(this.binaryPath, [fileName, outputName], {
				env: process.env,
				cwd: baseDir,
			});

			spawned.on("close", (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(
						new Error(`convert process exited with code ${code}`)
					);
				}
			});

			spawned.on("error", (err) => {
				reject(err);
			});
		});
	}
}
