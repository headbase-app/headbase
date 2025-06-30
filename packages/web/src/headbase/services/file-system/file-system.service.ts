import * as opfsx from "opfsx"
import {parseMarkdownFrontMatter} from "./frontmatter.ts";
import {EventsService} from "../events/events.service.ts";
// import {EventTypes} from "../events/events.ts";
import {DeviceContext} from "../../interfaces.ts";
import {relativeTree} from "./relative-tree.ts";
import {featureFlags} from "../../../flags.ts";
import {OPFSXDirectoryTree, parsePath} from "opfsx";
import {joinPathParts} from "./join-path-parts.ts";
import {EventMap, EventTypes} from "../events/events.ts";
import {Observable} from "rxjs";
import {LiveQueryResult} from "../../control-flow.ts";
import {LocalDocumentVersion} from "../documents/types.ts";


export interface MarkdownFile {
	folderPath: string
	filename: string
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

	async saveMarkdownFile(vaultId: string, file: MarkdownFile, oldFile?: MarkdownFile | null) {
		const relativePath = joinPathParts(file.folderPath, file.filename)
		const absolutePath = joinPathParts(`/headbase/${vaultId}/files/`, relativePath)

		const frontMatterString = Object.entries(file.fields)
				.map(([k, v]) => `${k}: ${v}`)
				.join("\n")
		const frontMatter = `---\n${frontMatterString}\n---`
		const content = `${frontMatter}${frontMatter && '\n\n'}${file.content}`

		if (featureFlags().debug_file_system) {
			console.debug(`[file-system] writing markdown file ${absolutePath}`)
			console.debug({frontMatter, content})
		}

		await opfsx.write(absolutePath, content)

		this.events.dispatch(EventTypes.FILE_SYSTEM_CHANGE, {
			context: this.context,
			data: {
				vaultId,
				action: 'save',
				path: relativePath
			}
		})

		// If file path has changed, remove old file.
		const oldRelativePath = oldFile && joinPathParts(oldFile.folderPath, oldFile.filename)
		if (oldRelativePath && oldRelativePath !== relativePath) {
			if (featureFlags().debug_file_system) {
				console.debug(`[file-system] detected move '${oldRelativePath}' -> '${relativePath}' on save`)
			}

			await this.delete(vaultId, oldRelativePath)
		}
	}

	async loadMarkdownFile(vaultId: string, relativePath: string): Promise<MarkdownFile> {
		const parsedPath = parsePath(relativePath)
		const absolutePath = `/headbase/${vaultId}/files/${relativePath}`

		const file = await opfsx.read(absolutePath)
		const fileText = await file.text()
		const parsedFile = parseMarkdownFrontMatter(fileText)

		// A newline is automatically added between the frontmatter and content when saving, so ensure this is removed
		const content = parsedFile.content.trim()

		if (featureFlags().debug_file_system) {
			console.debug(`[file-system] loaded file ${absolutePath}`)
			console.debug({frontMatter: parsedFile.data, content})
		}

		return {
			folderPath: parsedPath.parentPath,
			filename: file.name,
			fields: parsedFile.data,
			content,
		}
	}

	async delete(vaultId: string, relativePath: string) {
		const absolutePath = `/headbase/${vaultId}/files/${relativePath}`

		if (featureFlags().debug_file_system) {
			console.debug(`[file-system] deleting file ${absolutePath}`)
		}

		await opfsx.rm(absolutePath)

		this.events.dispatch(EventTypes.FILE_SYSTEM_CHANGE, {
			context: this.context,
			data: {
				vaultId,
				action: 'delete',
				path: relativePath
			}
		})
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

	liveTree(vaultId: string) {
		return new Observable<LiveQueryResult<OPFSXDirectoryTree>>((subscriber) => {
			subscriber.next({status: 'loading'})

			const runQuery = async () => {
				subscriber.next({status: 'loading'})
				const result = await this.tree(vaultId);
				subscriber.next({status: 'success', result: result})
			}

			const handleEvent = (e: EventMap["file-system-change"]) => {
				if (
					e.detail.data.vaultId === vaultId
				) {
					console.debug(`[liveTree] Received event that requires re-query`)
					runQuery()
				}
			}

			runQuery()

			this.events.subscribe(EventTypes.FILE_SYSTEM_CHANGE, handleEvent)

			return () => {
				this.events.unsubscribe(EventTypes.FILE_SYSTEM_CHANGE, handleEvent)
			}
		})
	}
}