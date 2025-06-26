import * as opfsx from "opfsx"
import {parseMarkdownFrontMatter} from "./frontmatter.ts";
import {EventsService} from "../events/events.service.ts";
// import {EventTypes} from "../events/events.ts";
import {DeviceContext} from "../../interfaces.ts";
import {relativeTree} from "./relative-tree.ts";
import {featureFlags} from "../../../flags.ts";


export interface MarkdownFile {
	path: string
	existingPath: string
	displayName: string
	fields: {
		[key: string]: string | number | boolean | null
	}
	content: string
}

export interface FileSystemServiceConfig {
	context: DeviceContext
}


export class FileSystemService {
	private context: DeviceContext

	constructor(
		config: FileSystemServiceConfig,
		private events: EventsService
	) {
		this.context = config.context

		// @ts-expect-error -- adding for easy debugging and testing during development
		window.opfsx = opfsx
	}

	async saveMarkdownFile(vaultId: string, file: Omit<MarkdownFile, 'existingPath'>, existingPath?: string | null) {
		const absolutePath = `/headbase/${vaultId}/files/${file.path}`

		const frontMatterString = Object.entries(file.fields)
				.map(([k, v]) => `${k}: ${v}`)
				.join("\n")
		const frontMatter = `---\n$name: ${file.displayName}\n${frontMatterString}\n---`
		const content = `${frontMatter}${frontMatter && '\n\n'}${file.content}`

		if (featureFlags().debug_file_system) {
			console.debug(`[file-system] writing markdown file ${absolutePath}`)
			console.debug(content)
		}

		await opfsx.write(absolutePath, content)

		// this.events.dispatch(EventTypes.FILE_SYSTEM_CHANGE, {
		// 	context: this.context,
		// 	data: {
		// 		vaultId,
		// 		action: 'save',
		// 		path: file.path,
		// 		content
		// 	}
		// })

		// If file path has changed, remove old file.
		if (existingPath && existingPath !== file.path) {
			const absolutePath = `/headbase/${vaultId}/files/${existingPath}`
			await opfsx.rm(absolutePath)

			// this.events.dispatch(EventTypes.FILE_SYSTEM_CHANGE, {
			// 	context: this.context,
			// 	data: {
			// 		vaultId,
			// 		action: 'delete',
			// 		path: existingPath
			// 	}
			// })
		}
	}

	async loadMarkdownFile(vaultId: string, relativePath: string): Promise<MarkdownFile> {
		const absolutePath = `/headbase/${vaultId}/files/${relativePath}`

		const file = await opfsx.read(absolutePath)
		const content = await file.text()
		const parsed = parseMarkdownFrontMatter(content)

		const {$name: frontMatterName, ...frontMatter } = parsed.data

		const displayName = typeof frontMatterName === 'string' ? frontMatterName : file.name.replace(".md", "")

		// A newline is automatically added between the frontmatter and content when saving, so ensure this is removed
		const trimmedContent = parsed.content.trim()

		if (featureFlags().debug_file_system) {
			console.debug(`[file-system] loaded file ${absolutePath}`)
			console.debug(content)
		}

		return {
			path: relativePath,
			existingPath: relativePath,
			displayName,
			fields: frontMatter,
			content: trimmedContent
		}
	}

	async delete(vaultId: string, relativePath: string) {
		const absolutePath = `/headbase/${vaultId}/files/${relativePath}`

		if (featureFlags().debug_file_system) {
			console.debug(`[file-system] deleting file ${absolutePath}`)
		}

		await opfsx.rm(absolutePath)

		// this.events.dispatch(EventTypes.FILE_SYSTEM_CHANGE, {
		// 	context: this.context,
		// 	data: {
		// 		vaultId,
		// 		action: 'delete',
		// 		path: relativePath
		// 	}
		// })
	}

	async query(vaultId: string) {
		const absolutePath = `/headbase/${vaultId}/files/`

		const items = await opfsx.ls(absolutePath, {recursive: true})

		// Only return files, and ensure paths are relative to vault directory.
		return items
			.filter(item => item.kind === 'file')
			.map(file => {
				return {
					...file,
					path: file.path.replace(`/headbase/${vaultId}/files`, ""),
				}
			})
	}

	async tree(vaultId: string) {
		const vaultPath = `/headbase/${vaultId}/files/`

		// Ensure the base directory exists as tree will fail without it
		await opfsx.mkdir(vaultPath)

		const tree = await opfsx.tree(vaultPath)
		return relativeTree(tree)
	}
}