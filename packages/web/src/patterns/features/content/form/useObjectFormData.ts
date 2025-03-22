import {useEffect, useState} from "react";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import {DataObject} from "../../../../logic/services/database/transactions/types.ts";

export interface ObjectFormOptions {
	objectId?: string
}

export interface ObjectFormData {
	type: string,
	data: string
}

export interface ObjectFormDataHandlers {
	onTypeChange: (name: string) => void;
	onDataChange: (data: string) => void;
}


export function useObjectFormData(options: ObjectFormOptions) {
	const {headbase, currentDatabaseId} = useHeadbase()
	
	const [object, setObject] = useState<DataObject | null>(null)
	const [type, setType] = useState<string>('test')
	const [data, setData] = useState<string>('')

	// Load object
	useEffect(() => {
		if (!headbase || !currentDatabaseId) return

		if (options.objectId) {
			const query = headbase.db.objectStore.liveGet(currentDatabaseId, options.objectId)
			const subscription = query.subscribe((liveQuery) => {
				if (liveQuery.status === 'success') {
					setObject(liveQuery.result)
					setType(liveQuery.result.type)
					setData(JSON.stringify(liveQuery.result.data))
					// todo: don't overwrite edits?
				}
				else if (liveQuery.status === 'error') {
					console.error('Error loading content')
					console.log(liveQuery.errors)
				}
			})

			return () => {
				subscription.unsubscribe()
			}
		}
	}, [options.objectId, currentDatabaseId])

	return {
		object,
		type,
		setType,
		data,
		setData,
	}
}
