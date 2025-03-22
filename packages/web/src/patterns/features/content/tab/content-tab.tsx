import {ContentForm} from "../form/content-form";

import { WithTabData } from "../../workspace/workspace";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useCallback, useEffect} from "react";
import {ObjectFormOptions, useObjectFormData} from "../form/useObjectFormData.ts";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";

export interface ContentTabProps extends WithTabData, ObjectFormOptions {}

export function ContentTab(props: ContentTabProps) {
	const {headbase, currentDatabaseId} = useHeadbase()
	const { replaceTab, setTabName, setTabIsUnsaved, closeTab } = useWorkspaceContext()

	const {
		object,
		type, setType,
		data, setData
	} = useObjectFormData({objectId: props.objectId})

	const onSave = useCallback(async () => {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId || !headbase) return

		if (props.objectId) {
			try {
				await headbase.db.objectStore.update(
					currentDatabaseId,
					props.objectId,
					{
						updatedBy: 'todo',
						type: type,
						data: JSON.parse(data)
					}
				)
				setTabIsUnsaved(props.tabIndex, false)
			}
			catch (e) {
				console.error(e)
			}
		}
		else {
			try {
				const newObject = await headbase.db.objectStore.create(
					currentDatabaseId,
					{
						createdBy: 'todo',
						type: type,
						data: JSON.parse(data)
					}
				)
				replaceTab(props.tabIndex, {type: 'object', objectId: newObject.id})
			}
			catch (e) {
				console.error(e)
			}
		}
	}, [headbase, replaceTab, setTabIsUnsaved])

	// contentId and contentTypeId are dependencies to ensure the tab name updates
	// when a "new content" tab is replaced with a "content" tab.
	useEffect(() => {
		if (typeof object?.data?.title === 'string') {
			setTabName(props.tabIndex, object.data.title)
		}
		else {
			setTabName(props.tabIndex, object?.id || type)
		}
	}, [object?.id]);

	const onDelete = useCallback(async () => {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId || !headbase) return

		if (!props.objectId) {
			// this should never really happen, but protect against it just in case.
			console.error('Attempted to delete with no objectId')
			return
		}

		try {
			await headbase.db.objectStore.delete(currentDatabaseId, props.objectId)
			closeTab(props.tabIndex)
		}
		catch (e) {
			console.error(e)
		}
	}, [props.objectId, headbase, currentDatabaseId])

	const onTypeChange = useCallback((type: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setType(type)
	}, [props.tabIndex])

	const onDataChange = useCallback((data: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setData(data)
	}, [props.tabIndex])

	return (
		<div>
			<ContentForm
				type={type}
				data={data}
				onTypeChange={onTypeChange}
				onDataChange={onDataChange}
				onSave={onSave}
				tabIndex={props.tabIndex}
				onDelete={props.objectId ? onDelete : undefined}
			/>
		</div>
	)
}