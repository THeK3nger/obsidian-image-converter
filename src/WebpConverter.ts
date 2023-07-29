import * as path from "path";
import * as cp from "child_process";
import { Converter } from "./Converter";

export class WebpConverter implements Converter {
	constructor(private cwebpPath: string) {}

	convert(filePath: string): Promise<void> {
		const baseDir = path.dirname(filePath);
		const fileName = path.basename(filePath);
		const fileBase = path.parse(fileName).name;

		return new Promise<void>((resolve, reject) => {
			console.log("Spawning cwebp process with args: ", [
				fileName,
				"-o",
				`${fileBase}.webp`,
			]);
			const spawned = cp.spawn(
				this.cwebpPath,
				[fileName, "-o", `${fileBase}.webp`],
				{
					env: process.env,
					cwd: baseDir,
				}
			);

			spawned.on("close", (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`cwebp process exited with code ${code}`));
				}
			});

			spawned.on("error", (err) => {
				reject(err);
			});
		});
	}
}
