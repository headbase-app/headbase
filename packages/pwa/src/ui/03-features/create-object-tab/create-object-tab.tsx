import {useDatabase} from "@/framework/use-database.ts";
import type {BaseTabProps} from "@ui/03-features/workspace/workspace-tab.tsx";
import {ObjectEditor, type ObjectEditorData} from "@ui/03-features/object-editor/object-editor.tsx";
import {useWorkspace} from "@/framework/workspace/workspace.context.ts";

export interface CreateObjectTabProps extends BaseTabProps {
	typeObjectId?: string
}

export function CreateObjectTab(props: CreateObjectTabProps) {
	const {replaceTab, setActiveTabId} = useWorkspace();
	const database  = useDatabase()

	async function onCreate(data: ObjectEditorData) {
		const hb = database()
		if (!hb) {
			throw new Error("Attempted to create object with no open vault.")
		}

		const object = await hb.create({
			createdBy: "todo",
			type: data.type,
			fields: data.fields,
			blob: data.blob,
		})

		replaceTab(props.tabId, {type: "object", objectId: object.id})
		setActiveTabId(props.tabId)
	}

	return (
		<ObjectEditor
			saveText="Create"
			data={{type: "", fields: {}}}
			onSave={onCreate}
		/>
	)
}
