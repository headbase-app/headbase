import { WithTabData } from "../../workspace/workspace";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useCallback, useEffect} from "react";
import {useViewFormData, ViewFormOptions} from "../form/useViewFormData";
import {ViewForm} from "../form/view-form";
import {JButton} from "@ben-ryder/jigsaw-react";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";

export interface ViewEditTabProps extends WithTabData, ViewFormOptions {}

export function ViewEditTab(props: ViewEditTabProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const { replaceTab, setTabName, setTabIsUnsaved, closeTab, openTab } = useWorkspaceContext()

	const {
		name,
		setName,
		description,
		setDescription,
		isFavourite,
		setIsFavourite,
	} = useViewFormData({viewId: props.viewId})

	const onSave = useCallback(async () => {
		if (!headbase || !currentDatabaseId) throw new Error("Headbase or currentDatabaseId not set")

		if (props.viewId) {
			try {
				await headbase.db.views.update(currentDatabaseId, props.viewId, {
					type: 'list',
					createdBy: 'todo',
					icon: null,
					name: name,
					colour: null,
					description: description,
					isFavourite: isFavourite,
					settings: null
				})
				setTabIsUnsaved(props.tabIndex, false)
			}
			catch (e) {
				console.error(e)
			}
		}
		else {
			try {
				const newView = await headbase.db.views.create(
					currentDatabaseId,
					{
						type: 'list',
						createdBy: 'todo',
						icon: null,
						colour: null,
						name: name,
						description: description,
						isFavourite: isFavourite,
						settings: null
					}
				)
				replaceTab(props.tabIndex, {type: 'view', viewId: newView.id})
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
			await headbase.db.views.delete(currentDatabaseId, props.viewId)
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

	const onIsFavouriteChange = useCallback((isFavourite: boolean) => {
		setTabIsUnsaved(props.tabIndex, true)
		setIsFavourite(isFavourite)
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
				isFavourite={isFavourite}
				onIsFavouriteChange={onIsFavouriteChange}
				onSave={onSave}
				tabIndex={props.tabIndex}
				onDelete={props.viewId ? onDelete : undefined}
			/>
		</div>
	)
}
