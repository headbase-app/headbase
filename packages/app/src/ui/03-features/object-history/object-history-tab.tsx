import type {BaseTabProps} from "@ui/03-features/workspace/workspace-tab.tsx";
import {ObjectHistory} from "@ui/03-features/object-history/object-history.tsx";
import {createEffect} from "solid-js";
import type {ObjectDto} from "@api/headbase/types.ts";
import {useWorkspace} from "@/framework/workspace/workspace.context.ts";
import {useDatabase} from "@/framework/use-database.ts";

export interface ObjectHistoryTabProps extends BaseTabProps {
	objectId: string
}

export function ObjectHistoryTab(props: ObjectHistoryTabProps) {
	const database = useDatabase()
	const { setTabName } = useWorkspace()

	function setTabData(object: ObjectDto) {
		let name = "[HISTORY] "
		if (object.type === "https://headbase.app/v1/type") {
			name += " [TYPE] "
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
			setTabData(object)
		}
		catch (e) {
			console.error("An error occurred loading the object", e)
		}
	})

	return (
		<ObjectHistory objectId={props.objectId} />
	)
}
