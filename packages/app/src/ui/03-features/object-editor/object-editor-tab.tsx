import type {BaseTabProps} from "@ui/03-features/workspace/workspace-tab.tsx";
import {useDatabase} from "@/framework/use-database.ts";
import {createEffect, createSignal} from "solid-js";
import {ObjectEditor, type ObjectEditorData} from "@ui/03-features/object-editor/object-editor.tsx";
import {useWorkspace} from "@/framework/workspace/workspace.context.ts";
import type {ObjectDto} from "@api/database/types.ts";

export interface ObjectEditorTabProps extends BaseTabProps {
	objectId: string
}

export function ObjectEditorTab(props: ObjectEditorTabProps) {
	const { setTabName } = useWorkspace()
	const database = useDatabase();
	const [objectData, setObjectData] = createSignal<ObjectEditorData>({type: "", fields: {}})

	function setTabData(object: ObjectDto) {
		let name = ""
		if (object.type === "https://headbase.app/v1/type") {
			name += "[TYPE] "
		}
		if (typeof object.fields.title === 'string') {
			name += object.fields.title
		}
		else {
			name += object.id
		}
		setTabName(props.tabId, name)
	}

	createEffect(async () => {
		const hb = database()
		if (!hb) return;

		try {
			const object = await hb.get(props.objectId)
			setObjectData({
				type: object.type,
				fields: object.fields,
				blob: object.blob,
			})
			setTabData(object)
		}
		catch (e) {
			console.error("An error occurred loading the object", e)
		}
	})

	async function onSave(data: ObjectEditorData) {
		const hb = database()
		if (!hb) {
			throw new Error("Attempted to create object with no open vault.")
		}

		const updatedObject = await hb.update(props.objectId, {
			updatedBy: "todo",
			type: data.type,
			fields: data.fields,
			blob: data.blob,
		})
		setTabData(updatedObject)
	}

	return (
		<div>
			<ObjectEditor
				saveText="Save"
				data={objectData()}
				onSave={onSave}
			/>
		</div>
	)
}
