function getLocalLinkTarget(
	line: string,
	cursorOffset: number
): { target: string; start: number } | null {
	const linkPatterns = [
		/!?\[\[([^\]]+)\]\]/g,
		/!?\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g,
	];

	for (const pattern of linkPatterns) {
		for (const match of line.matchAll(pattern)) {
			const matchStart = match.index;
			const matchEnd = matchStart + match[0].length;
			if (cursorOffset < matchStart || cursorOffset > matchEnd) continue;

			const capturedTarget = match[1];
			const targetOffset = match[0].indexOf(capturedTarget);
			const isAngleBracketLink =
				capturedTarget.startsWith("<") && capturedTarget.endsWith(">");
			const target = isAngleBracketLink
				? capturedTarget.slice(1, -1)
				: capturedTarget;

			return {
				target,
				start: matchStart + targetOffset + (isAngleBracketLink ? 1 : 0),
			};
		}
	}

	return null;
}

function getBasename(filePath: string): string {
	const normalizedPath = filePath.replace(/\\/g, "/");
	return normalizedPath.slice(normalizedPath.lastIndexOf("/") + 1);
}

export function replaceImageLinkExtensionAtCursor(
	line: string,
	cursorOffset: number,
	filePath: string,
	targetExtension: string
): string | null {
	const link = getLocalLinkTarget(line, cursorOffset);
	if (!link) return null;

	const aliasOffset = link.target.indexOf("|");
	const targetWithoutAlias =
		aliasOffset === -1 ? link.target : link.target.slice(0, aliasOffset);
	const suffixOffset = targetWithoutAlias.search(/[?#]/);
	const pathPart =
		suffixOffset === -1
			? targetWithoutAlias
			: targetWithoutAlias.slice(0, suffixOffset);

	let decodedPath: string;
	try {
		decodedPath = decodeURIComponent(pathPart);
	} catch {
		return null;
	}

	if (getBasename(decodedPath).toLowerCase() !== getBasename(filePath).toLowerCase()) {
		return null;
	}

	const extensionOffset = pathPart.lastIndexOf(".");
	const slashOffset = Math.max(pathPart.lastIndexOf("/"), pathPart.lastIndexOf("\\"));
	if (extensionOffset <= slashOffset) return null;

	const extensionStart = link.start + extensionOffset + 1;
	const currentExtension = pathPart.slice(extensionOffset + 1);
	return (
		line.slice(0, extensionStart) +
		targetExtension +
		line.slice(extensionStart + currentExtension.length)
	);
}
