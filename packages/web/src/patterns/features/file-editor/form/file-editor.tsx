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
import {Shapes as ChangeTypeIcon} from "lucide-react"

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
				<JButtonGroup>
					<JTooltip content="Change file type" renderAsChild={true} variant='dark'>
						<button
							type="button"
							aria-label='Change file type'
							className="menu-panel__menu"
							onClick={() => {}}
						><ChangeTypeIcon/></button>
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
						label="File Path"
						id="path"
						type="text"
						required
						tooltip={{content: "The full path of the file (including .md), relative to the vault root."}}
						value={props.path}
						onChange={(e) => {
							props.onPathChange(e.target.value);
						}}
						placeholder="/notes/example.md"
					/>
				</JFormRow>
				<JFormRow>
					<JInput
						label="Display Name"
						id="name"
						type="text"
						required
						tooltip={{content: "The display name used when displaying the file in lists, tabs etc."}}
						value={props.name}
						onChange={(e) => {
							props.onNameChange(e.target.value);
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
