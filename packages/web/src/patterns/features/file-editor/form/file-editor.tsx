import {FormEvent} from "react";
import {
	JInput,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow, JTextArea, JLabel, JTooltip
} from "@ben-ryder/jigsaw-react";
import { WithTabData } from "../../workspace/workspace";
import {FileEditorData, FileEditorChangeHandlers} from "./useFileEditor.ts";

import "./file-editor.css"
import {MarkdownEditor} from "../../../components/markdown-editor/markdown-editor.tsx";
import {Shapes as ChangeTypeIcon, History as HistoryIcon} from "lucide-react"

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
		<JForm className="file-editor" onSubmit={onSave}>
			<JFormRow>
				<JButtonGroup align="right">
					<JTooltip content="Change file type" renderAsChild={true} variant='dark'>
						<button
							type="button"
							aria-label='Change file type'
							className="menu-panel-button menu-panel__menu"
							onClick={() => {}}
						><ChangeTypeIcon/></button>
					</JTooltip>
					<JTooltip content="View history" renderAsChild={true} variant='dark'>
						<button
							type="button"
							aria-label='View history'
							className="menu-panel-button menu-panel__menu"
							onClick={() => {}}
						><HistoryIcon/></button>
					</JTooltip>
					{props.onDelete &&
              <JButton
                  type="button"
                  variant="destructive"
                  onClick={() => {
										if (props.onDelete) {
											props.onDelete()
										}
									}}
              >Delete</JButton>
					}
					<JButton type="submit">Save</JButton>
				</JButtonGroup>
			</JFormRow>
			<JFormContent>
				<JFormRow>
					<JInput
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
				</JFormRow>
				<JFormRow>
					<JInput
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
				</JFormRow>
				<JFormRow>
					<JTextArea
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
				</JFormRow>

				<JLabel htmlFor="content">Content</JLabel>
				<MarkdownEditor
					id='content'
					value={props.content}
					onChange={(value) => {
						props.onContentChange(value)
					}}
				/>
			</JFormContent>
		</JForm>
	);
}
