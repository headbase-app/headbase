import {useEffect, useRef, useState} from "react";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import {ViewDto} from "../../../../logic/schemas/views/dtos.ts";
import {LiveQueryStatus} from "../../../../logic/control-flow.ts";

export interface ViewFormOptions {
	viewId?: string
}

export interface ViewFormData {
	// Basic Data
	name: string,
	description: string | null
	isFavourite: boolean
}

export interface ViewFormDataHandlers {
	onNameChange: (name: string) => void;
	onDescriptionChange: (description: string) => void;
	onIsFavouriteChange: (isFavourite: boolean) => void
}

/**
 *
 * @param options
 */
export function useViewFormData(options: ViewFormOptions) {
	const { headbase } = useHeadbase()
	const {currentDatabaseId} = useHeadbase()

	const latestView = useRef<ViewDto | undefined>()
	const [view, setView] = useState<ViewDto | undefined>()

	const latestName = useRef<string>('')
	const [name, setName] = useState<string>('')

	const latestDescription = useRef<string|null>(null)
	const [description, setDescription] = useState<string|null>(null)

	const latestIsFavourite = useRef<boolean>(false)
	const [isFavourite, setIsFavourite] = useState<boolean>(false)

	// Load content
	useEffect(() => {
		if (!headbase || !currentDatabaseId) throw new Error("Headbase or currentDatabaseId not set")

		if (options.viewId) {
			const viewQuery = headbase.db.liveGetView(options.viewId)
			const subscription = viewQuery.subscribe((liveQuery) => {
				if (liveQuery.status === LiveQueryStatus.SUCCESS) {

					/**
					 * This logic "merges" the new loaded content with the existing content, and will
					 * not overwrite anything that the user has changed so edits are not lost.
					 */
					if (latestName.current === '' || latestName.current === latestView.current?.name) {
						setName(liveQuery.result.name)
					}
					if (latestDescription.current === '' || latestDescription.current === undefined || latestDescription.current === latestView.current?.description) {
						setDescription(liveQuery.result.description)
					}
					if (!latestIsFavourite.current || latestIsFavourite.current === latestView.current?.isFavourite) {
						setIsFavourite(liveQuery.result.isFavourite ?? false)
					}

					// todo: add for more fields/settings?

					setView(liveQuery.result)
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
	}, [options.viewId, currentDatabaseId, headbase])

	useEffect(() => {
		latestName.current = name
	}, [name]);

	useEffect(() => {
		latestDescription.current = description
	}, [description]);

	useEffect(() => {
		latestView.current = view
	}, [view])

	useEffect(() => {
		latestIsFavourite.current = isFavourite
	}, [isFavourite])

	return {
		name,
		setName,
		description,
		setDescription,
		isFavourite,
		setIsFavourite,
	}
}
