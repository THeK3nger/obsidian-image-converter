import * as path from "path";
import * as cp from "child_process";

import { Converter } from "./Converter";

export class ImageMagickConverter implements Converter {
	constructor(
		private binaryPath: string,
		private destinationExtension: string
	) {}

	convert(filePath: string): Promise<void> {
		const baseDir = path.dirname(filePath);
		const fileName = path.basename(filePath);
		const fileBase = path.parse(fileName).name;

		return new Promise<void>((resolve, reject) => {
			const spawned = cp.spawn(
				this.binaryPath,
				[fileName, `${fileBase}.${this.destinationExtension}`],
				{
					env: process.env,
					cwd: baseDir,
				}
			);

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
