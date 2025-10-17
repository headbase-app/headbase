import {FormEvent} from "react";
import { WithTabData } from "../../workspace/workspace";
import {FileEditorData, FileEditorChangeHandlers} from "./use-file-editor";
import {Shapes as ChangeTypeIcon, History as HistoryIcon} from "lucide-react"
import {MarkdownEditor} from "@ui/02-components/markdown-editor/markdown-editor";
import {Label} from "@ui/01-atoms/label/label";
import {Input} from "@ui/01-atoms/input/input";
import {Tooltip} from "@ui/02-components/tooltip/tooltip";
import {Button} from "@ui/01-atoms/button/button";

export interface FileEditorProps extends WithTabData, FileEditorData, FileEditorChangeHandlers {
	onSave: () => void;
	onDelete?: () => void;
}

// todo: handle situation where editor is open and file gets deleted?

export function FileEditor(props: FileEditorProps) {
	function onSave(e: FormEvent) {
		e.preventDefault()
		props.onSave();
	}

	return (
		<div className="file-editor" onSubmit={onSave}>
			<Tooltip content="Change file type" renderAsChild={true}>
				<button
					type="button"
					aria-label='Change file type'
					className="menu-panel-button menu-panel__menu"
					onClick={() => {}}
				><ChangeTypeIcon/></button>
			</Tooltip>
			<Tooltip content="View history" renderAsChild={true}>
				<button
					type="button"
					aria-label='View history'
					className="menu-panel-button menu-panel__menu"
					onClick={() => {}}
				><HistoryIcon/></button>
			</Tooltip>
			{props.onDelete &&
				<Button
					type="button"
					variant="destructive"
					onClick={() => {
						if (props.onDelete) {
							props.onDelete()
						}
					}}
				>Delete</Button>
			}
			<Input
				label="Folder"
				id="path"
				type="text"
				required
				tooltip={{content: "The folder the file is in, a path relative to the vault root."}}
				value={props.folderPath}
				onChange={(e) => {
					props.onFolderPathChange(e.target.value);
				}}
				placeholder="/notes/example.md"
			/>
			<Input
				label="Filename"
				id="name"
				type="text"
				required
				tooltip={{content: "The filename of the file (excluding .md)"}}
				value={props.filename}
				onChange={(e) => {
					props.onFilenameChange(e.target.value);
				}}
				placeholder="Example"
			/>
			<textarea
				label="Fields"
				id="fields"
				rows={5}
				tooltip={{content: "key:value fields which can be used in queries"}}
				placeholder="field1: value&#10;field2: value2"
				value={props.fields}
				onChange={(e) => {
					props.onFieldsChange(e.target.value);
				}}
			/>
			<Label htmlFor="content">Content</Label>
			<MarkdownEditor
				id='content'
				value={props.content}
				onChange={(value) => {
					props.onContentChange(value)
				}}
			/>
		</div>
	);
}
