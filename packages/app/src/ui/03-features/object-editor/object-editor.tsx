import type {ObjectBlobData, ObjectFields} from "@api/headbase/types.ts";
import {Show} from "solid-js";

export interface ObjectEditorData {
	type: string;
	fields: ObjectFields
	blob?: ObjectBlobData | null
}

export interface ObjectEditorProps {
	saveText: string
	data: ObjectEditorData
	onSave: (data: ObjectEditorData) => void
	onOpenHistory?: () => void
}

export function ObjectEditor(props: ObjectEditorProps) {
	let form!: HTMLFormElement

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		const formData = new FormData(form)

		const type = formData.get("type") as string
		const fields = JSON.parse(formData.get("fields") as string)
		const blobFile = formData.get("blob") as File|undefined
		// FormData seems to always return empty/blank file, so check if file has been selected based on the name.
		const blob = blobFile && blobFile?.name !== ""
			? await blobFile.arrayBuffer()
			: null

		props.onSave({type, fields, blob})
	}

	return (
		<div>
			<div>
				<Show when={props.onOpenHistory}>
					<button onClick={props.onOpenHistory}>View history</button>
				</Show>
			</div>
			<form ref={form} onSubmit={onSubmit}>
				<div>
					<label for="type">Type</label>
					<input
						id="type"
						name="type"
						placeholder="https://headbase.app/v1/type"
						value={props.data.type}
					/>
					<p>Use <b>https://headbase.app/v1/type</b> for defining a type or any text like <b>note</b> or <b>task</b></p>
				</div>
				<div>
					<label for="fields">Fields</label>
					<textarea
						id="fields"
						name="fields"
						placeholder="json data here..."
						rows={5}
						value={JSON.stringify(props.data.fields)}
					/>
				</div>
				<div>
					<Show when={props.data.blob}>
						<p>Blob added to object. Upload a new blob below...</p>
					</Show>
					<label for="blob">Blob</label>
					<input
						id="blob"
						name="blob"
						type="file"
						placeholder="upload file to object blob..."
					/>
				</div>
				<div>
					<button type="submit">{props.saveText}</button>
				</div>
			</form>
		</div>
	)
}
