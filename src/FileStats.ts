import * as fs from "fs";

export class FileStats {
	static getSize(path: string): number {
		const stats = fs.statSync(path);
		const fileSizeInBytes = stats.size;
		return fileSizeInBytes;
	}
}
