import {ContentForm} from "../form/content-form";

import { WithTabData } from "../../workspace/workspace";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useCallback, useEffect} from "react";
import {ContentFormOptions, useContentFormData} from "../form/useContentFormData";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";

export interface ContentTabProps extends WithTabData, ContentFormOptions {}

export function ContentTab(props: ContentTabProps) {
	const {headbase, currentDatabaseId} = useHeadbase()
	const { replaceTab, setTabName, setTabIsUnsaved, closeTab } = useWorkspaceContext()

	const {
		contentType,
		contentTypeId,
		name,
		setName,
		tags,
		setTags,
		isFavourite,
		setIsFavourite,
		fieldStorage,
		setField,
	} = useContentFormData({contentId: props.contentId, contentTypeId: props.contentTypeId})

	const onSave = useCallback(async () => {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId || !headbase) return

		if (!contentTypeId) {
			// this should never really happen, but protect against it just in case.
			console.error('Attempted to save with no content type')
			return
		}

		if (props.contentId) {
			try {
				await headbase.db.contentItems.update(
					currentDatabaseId,
					props.contentId,
					{
						createdBy: 'todo',
						type: contentTypeId,
						name: name,
						fields: fieldStorage,
						isFavourite: isFavourite
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
				const newContent = await headbase.db.contentItems.create(
					currentDatabaseId,
					{
						createdBy: 'todo',
						type: contentTypeId,
						name: name,
						fields: fieldStorage,
						isFavourite: isFavourite
					}
				)
				replaceTab(props.tabIndex, {type: 'content', contentId: newContent.id})
			}
			catch (e) {
				console.error(e)
			}
		}
	}, [headbase, contentTypeId, replaceTab, setTabIsUnsaved, fieldStorage])

	// contentId and contentTypeId are dependencies to ensure the tab name updates
	// when a "new content" tab is replaced with a "content" tab.
	useEffect(() => {
		setTabName(props.tabIndex, name)
	}, [name, props.contentId, props.contentTypeId]);

	const onDelete = useCallback(async () => {
		// todo: does this need feedback of some kind?
		if (!currentDatabaseId || !headbase) return

		if (!props.contentId) {
			// this should never really happen, but protect against it just in case.
			console.error('Attempted to delete content with no contentId')
			return
		}

		try {
			await headbase.db.contentItems.delete(currentDatabaseId, props.contentId)
			closeTab(props.tabIndex)
		}
		catch (e) {
			console.error(e)
		}
	}, [props.contentId, headbase, currentDatabaseId])

	const onNameChange = useCallback((name: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setName(name)
	}, [props.tabIndex])

	const onTagsChange = useCallback((tags: string[]) => {
		setTabIsUnsaved(props.tabIndex, true)
		setTags(tags)
	}, [props.tabIndex])

	const onIsFavouriteChange = useCallback((isFavourite: boolean) => {
		setTabIsUnsaved(props.tabIndex, true)
		setIsFavourite(isFavourite)
	}, [props.tabIndex])

	return (
		<div>
			<ContentForm
				name={name}
				tags={tags}
				onNameChange={onNameChange}
				onTagsChange={onTagsChange}
				isFavourite={isFavourite}
				onIsFavouriteChange={onIsFavouriteChange}
				onSave={onSave}
				tabIndex={props.tabIndex}
				onDelete={props.contentId ? onDelete : undefined}
				fields={contentType?.templateFields}
				fieldStorage={fieldStorage}
				onFieldStorageChange={setField}
			/>
		</div>
	)
}