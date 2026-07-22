import { matter } from "gray-matter-es";

import {
	SourceMetadata,
	SourcePlugin
} from "../../02-apis/plugin/plugins/source-plugin/source-plugin.ts";
import {DataObject} from "@headbase-app/lib";
import {InferObjectFromFieldDefinitions} from "../../02-apis/plugin/plugins/source-plugin/dynamic-fields.ts";

const MarkdownMetadata = {
	id: "https://spec.headbase.app/v1/sources/markdown",
	name: "Markdown Files (.md)",
	description: "Load data from markdown files, parsing frontmatter as fields.",
	settings: {
		from: {
			label: "Source Folder",
			type: "short-text",
			hint: "The source folder to load files from (defaults to directory with)."
		},
		recursive: {
			label: "Load Recursively?",
			type: "checkbox",
			hint: "Should files be loaded from nested folders or only from the top level.",
			defaultValue: true
		}
	}
} satisfies SourceMetadata

export class MarkdownSourcePlugin extends SourcePlugin {
	static meta: SourceMetadata = MarkdownMetadata
	// todo: source plugin should allow type generic for settings?
	declare settings: InferObjectFromFieldDefinitions<typeof MarkdownMetadata["settings"]>

	async load(): Promise<DataObject[]> {
		const pattern = this.settings.recursive ? "**/*.md" : "*.md";
		const from  = this.settings.from ? this.settings.from  : "/"
		const files = await this.apis.filesAPI.glob(from, pattern)

		const results: DataObject[] = []
		for (const file of files) {
			const result = await this.apis.filesAPI.readAsText(file.path)
			const {data: fields} = matter(result.text)

			for (const [key, value] of Object.entries(fields)) {
				if (value === "$file.name") {
					fields[key] = file.name
				} else if (value === "$file.text") {
					fields[key] = result.text
				}
			}

			results.push({
				...fields,
				// "$file" after fields spread to ensure it isn't overwritten
				$file: {
					name: file.name,
					path: file.path,
					// Frontmatter is included in text content as this is the content of the file, the editor can handle this how it wants.
					text: result.text,
				},
			})
		}

		return results;
	}
}
