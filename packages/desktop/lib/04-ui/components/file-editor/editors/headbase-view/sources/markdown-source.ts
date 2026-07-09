import {
	DataSourceMetadata,
	DataSourcePlugin,
	InferDataFromFieldDefinitions
} from "../../../../../../02-apis/plugin/plugins/data-source-plugin.ts";

const MarkdownMetadata = {
	id: "https://spec.headbase.app/v1/data-source/markdown",
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
} satisfies DataSourceMetadata

export class MarkdownSourcePlugin extends DataSourcePlugin {
	static meta: DataSourceMetadata = MarkdownMetadata

	query(settings: InferDataFromFieldDefinitions<typeof MarkdownMetadata["settings"]>): string[] {
		return [];
	}
}
