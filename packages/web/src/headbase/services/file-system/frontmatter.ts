/**
 * This file is a modified version of the https://www.npmjs.com/package/frontmatter package (MIT licensed).
 * Thanks go to the package author Leo Wong for his original implementation.
 * */

import yaml from "js-yaml"

const pattern = /(^-{3}(?:\r\n|\r|\n)([\w\W]*?)-{3}(?:\r\n|\r|\n))?([\w\W]*)*/;

export interface ParsedFile {
	content: string
	data: {
		[key: string]: string | number | boolean | null
	}
}

export function parseMarkdownFrontMatter(content: string): ParsedFile {
	const parsed: ParsedFile = {
		data: {},
		content
	}

	const matches = content.match(pattern);
	if (!matches) {
		return parsed
	}

	if (matches[2] !== undefined) {
		parsed.data = yaml.load(matches[2]) as ParsedFile['data'] ?? {}
	}

	if (matches[3] !== undefined) {
		parsed.content = matches[3];
	}

	return parsed;
}
