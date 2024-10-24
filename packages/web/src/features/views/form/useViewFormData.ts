import {useEffect, useRef, useState} from "react";
import {ViewDto} from "../../../state/schemas/views/views";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../state/headbase";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";

export interface ViewFormOptions {
	viewId?: string
}

export interface ViewFormData {
	// Basic Data
	name: string,
	description?: string
	tags: string[]
	isFavourite?: boolean
	// Query Data
	queryContentTypes: string[],
	queryTags: string[],
}

export interface ViewFormDataHandlers {
	onNameChange: (name: string) => void;
	onDescriptionChange: (description: string) => void;
	onTagsChange: (tags: string[]) => void;
	onIsFavouriteChange: (isFavourite: boolean) => void
	onQueryContentTypesChange: (tags: string[]) => void;
	onQueryTagsChange: (tags: string[]) => void;
}

/**
 *
 * @param options
 */
export function useViewFormData(options: ViewFormOptions) {
	const {currentDatabase} = useHeadbase<HeadbaseTableTypes, HeadbaseTableSchemas>()

	const latestView = useRef<ViewDto | undefined>()
	const [view, setView] = useState<ViewDto | undefined>()

	const latestName = useRef<string>('')
	const [name, setName] = useState<string>('')

	const latestDescription = useRef<string|undefined>(undefined)
	const [description, setDescription] = useState<string|undefined>(undefined)

	const latestTags = useRef<string[]>([])
	const [tags, setTags] = useState<string[]>([])

	const latestIsFavourite = useRef<boolean>(false)
	const [isFavourite, setIsFavourite] = useState<boolean>(false)

	const latestQueryTags = useRef<string[]>([])
	const [queryTags, setQueryTags] = useState<string[]>([])

	const latestQueryContentTypes = useRef<string[]>([])
	const [queryContentTypes, setQueryContentTypes] = useState<string[]>([])

	// Load content
	useEffect(() => {
		if (!currentDatabase) return

		if (options.viewId) {
			const viewQuery = currentDatabase?.liveGet('views', options.viewId)
			const subscription = viewQuery.subscribe((liveQuery) => {
				if (liveQuery.status === LiveQueryStatus.SUCCESS) {

					/**
					 * This logic "merges" the new loaded content with the existing content, and will
					 * not overwrite anything that the user has changed so edits are not lost.
					 */
					if (latestName.current === '' || latestName.current === latestView.current?.data.name) {
						setName(liveQuery.result.data.name)
					}
					if (latestDescription.current === '' || latestDescription.current === undefined || latestDescription.current === latestView.current?.data.description) {
						setDescription(liveQuery.result.data.description)
					}
					// todo: I don't think this array comparison will work, might need to "diff" it instead?
					if (latestTags.current.length === 0 || latestTags.current === latestView.current?.data.tags) {
						setTags(liveQuery.result.data.tags)
					}
					if (!latestIsFavourite.current || latestIsFavourite.current === latestView.current?.data.isFavourite) {
						setIsFavourite(liveQuery.result.data.isFavourite ?? false)
					}

					// todo: I don't think this array comparison will work, might need to "diff" it instead?
					if (latestQueryTags.current.length === 0 || latestQueryTags.current === latestView.current?.data.queryTags) {
						setQueryTags(liveQuery.result.data.queryTags)
					}
					if (latestQueryContentTypes.current.length === 0 || latestQueryContentTypes.current === latestView.current?.data.queryContentTypes) {
						setQueryContentTypes(liveQuery.result.data.queryContentTypes)
					}

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
	}, [options.viewId, currentDatabase])

	useEffect(() => {
		latestName.current = name
	}, [name]);

	useEffect(() => {
		latestDescription.current = description
	}, [description]);

	useEffect(() => {
		latestTags.current = tags
	}, [tags]);

	useEffect(() => {
		latestView.current = view
	}, [view])

	useEffect(() => {
		latestIsFavourite.current = isFavourite
	}, [isFavourite])

	useEffect(() => {
		latestQueryTags.current = queryTags
	}, [queryTags]);

	useEffect(() => {
		latestQueryContentTypes.current = queryContentTypes
	}, [queryContentTypes]);

	return {
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
	}
}
