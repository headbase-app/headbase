import { WithTabData } from "../../workspace/workspace";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useCallback, useEffect} from "react";
import {useViewFormData, ViewFormOptions} from "../form/useViewFormData";
import {ViewForm} from "../form/view-form";
import {JButton} from "@ben-ryder/jigsaw-react";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {TableSchema, TableTypes} from "@headbase-toolkit/schemas/schema";

export interface ViewEditTabProps extends WithTabData, ViewFormOptions {}

export function ViewEditTab(props: ViewEditTabProps) {
	const {currentDatabaseId, headbase} = useHeadbase<TableTypes, TableSchema>()
	const { replaceTab, setTabName, setTabIsUnsaved, closeTab, openTab } = useWorkspaceContext()

	const {
		name,
		setName,
		description,
		setDescription,
		tags,
		setTags,
		isFavourite,
		setIsFavourite,
		queryTags,
		setQueryTags,
		queryContentTypes,
		setQueryContentTypes,
	} = useViewFormData({viewId: props.viewId})

	const onSave = useCallback(async () => {
		if (!headbase || !currentDatabaseId) throw new Error("Headbase or currentDatabaseId not set")

		if (props.viewId) {
			try {
				await headbase.tx.update(currentDatabaseId, 'views', props.viewId, {
					name: name,
					description: description !== '' ? description : undefined,
					tags:  tags,
					isFavourite: isFavourite,
					queryTags: queryTags,
					queryContentTypes: queryContentTypes,
				})
				setTabIsUnsaved(props.tabIndex, false)
			}
			catch (e) {
				console.error(e)
			}
		}
		else {
			try {
				const newViewId = await headbase.tx.create(currentDatabaseId, 'views', {
					name: name,
					description: description !== '' ? description : undefined,
					tags:  tags,
					isFavourite: isFavourite,
					queryTags: queryTags,
					queryContentTypes: queryContentTypes,
				})
				replaceTab(props.tabIndex, {type: 'view', viewId: newViewId})
			}
			catch (e) {
				console.error(e)
			}
		}
	}, [replaceTab, setTabIsUnsaved])

	// viewId is a dependency to ensure the tab name updates
	// when a "new view" tab is replaced with a "view" tab.
	useEffect(() => {
		setTabName(props.tabIndex, name)
	}, [name, props.viewId]);

	const onDelete = useCallback(async () => {
		if (!headbase || !currentDatabaseId) throw new Error("Headbase or currentDatabaseId not set")

		if (!props.viewId) {
			// this should never really happen, but protect against it just in case.
			console.error('Attempted to delete view with no viewId')
			return
		}

		try {
			await headbase.tx.delete(currentDatabaseId, 'views', props.viewId)
			closeTab(props.tabIndex)
		}
		catch (e) {
			console.error(e)
		}
	}, [props.viewId, headbase, currentDatabaseId])

	const onNameChange = useCallback((name: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setName(name)
	}, [props.tabIndex])

	const onDescriptionChange = useCallback((description: string) => {
		setTabIsUnsaved(props.tabIndex, true)
		setDescription(description)
	}, [props.tabIndex])

	const onTagsChange = useCallback((tags: string[]) => {
		setTabIsUnsaved(props.tabIndex, true)
		setTags(tags)
	}, [props.tabIndex])

	const onIsFavouriteChange = useCallback((isFavourite: boolean) => {
		setTabIsUnsaved(props.tabIndex, true)
		setIsFavourite(isFavourite)
	}, [props.tabIndex])

	const onQueryTagsChange = useCallback((queryTags: string[]) => {
		setTabIsUnsaved(props.tabIndex, true)
		setQueryTags(queryTags)
	}, [props.tabIndex])

	const onQueryContentTypesChange = useCallback((queryContentTypes: string[]) => {
		setTabIsUnsaved(props.tabIndex, true)
		setQueryContentTypes(queryContentTypes)
	}, [props.tabIndex])

	return (
		<div>
			{props.viewId &&
          <JButton
          	variant='secondary'
          	onClick={() => {
          		if (props.viewId) {
          			openTab({type: 'view', viewId: props.viewId})
          		}
          	}}
          >View</JButton>
			}
			<ViewForm
				name={name}
				onNameChange={onNameChange}
				description={description}
				onDescriptionChange={onDescriptionChange}
				tags={tags}
				onTagsChange={onTagsChange}
				isFavourite={isFavourite}
				onIsFavouriteChange={onIsFavouriteChange}
				queryTags={queryTags}
				onQueryTagsChange={onQueryTagsChange}
				queryContentTypes={queryContentTypes}
				onQueryContentTypesChange={onQueryContentTypesChange}
				onSave={onSave}
				tabIndex={props.tabIndex}
				onDelete={props.viewId ? onDelete : undefined}
			/>
		</div>
	)
}
