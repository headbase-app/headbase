import {useCallback, useEffect, useRef, useState} from "react";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {TableSchema, TableTypes} from "@headbase-toolkit/schemas/schema";
import {FieldStorage, FieldValues} from "@headbase-toolkit/schemas/entities/fields/fields";
import {EntityDto} from "@headbase-toolkit/schemas/common/entities";
import {ContentTypeData} from "@headbase-toolkit/schemas/entities/content-types";
import {ContentData} from "@headbase-toolkit/schemas/entities/content";

// todo: make type require at least one of these?
export interface ContentFormOptions {
	contentTypeId?: string
	contentId?: string
}

export interface ContentFormData {
	name: string,
	tags: string[]
	isFavourite?: boolean
	fieldStorage: FieldStorage
}

export interface ContentFormDataHandlers {
	onNameChange: (name: string) => void;
	onTagsChange: (tags: string[]) => void;
	onIsFavouriteChange: (isFavourite: boolean) => void
	onFieldStorageChange: (key: string, value: FieldValues) => void
}

/**
 *
 * @param options
 */
export function useContentFormData(options: ContentFormOptions) {
	const {headbase, currentDatabaseId} = useHeadbase<TableTypes, TableSchema>()

	const [contentTypeId, setContentTypeId] = useState<string | undefined>(options.contentTypeId)
	const [contentType, setContentType] = useState<EntityDto<ContentTypeData> | undefined>()

	const latestFieldStorage = useRef<FieldStorage>({})
	const [fieldStorage, setFieldStorage] = useState<FieldStorage>({})

	const latestContent = useRef<EntityDto<ContentData> | undefined>()
	const [content, setContent] = useState<EntityDto<ContentData> | undefined>()

	const latestName = useRef<string>('')
	const [name, setName] = useState<string>('')

	const latestTags = useRef<string[]>([])
	const [tags, setTags] = useState<string[]>([])

	const latestIsFavourite = useRef<boolean>(false)
	const [isFavourite, setIsFavourite] = useState<boolean>(false)

	// Load content type
	useEffect(() => {
		if (!headbase || !currentDatabaseId) return

		const queryContentTypeId = options.contentTypeId || contentTypeId
		if (queryContentTypeId) {
			const contentTypeQuery = headbase.tx.liveGet(currentDatabaseId, 'content_types', queryContentTypeId)
			const subscription = contentTypeQuery.subscribe((liveQuery) => {
				if (liveQuery.status === 'success') {
					setContentType(liveQuery.result)
				}
				else if (liveQuery.status === 'error') {
					console.error('Error loading content type')
					console.log(liveQuery.errors)
				}
			})

			return () => {
				subscription.unsubscribe()
			}
		}
	}, [options.contentTypeId, contentTypeId, currentDatabaseId])

	// Load content
	useEffect(() => {
		if (!headbase || !currentDatabaseId) return

		if (options.contentId) {
			const contentQuery = headbase.tx.liveGet(currentDatabaseId, 'content', options.contentId)
			const subscription = contentQuery.subscribe((liveQuery) => {
				if (liveQuery.status === 'success') {
					/**
					 * This logic "merges" the new loaded content with the existing content, and will
					 * not overwrite anything that the user has changed so edits are not lost.
					 */
					if (latestName.current === '' || latestName.current === latestContent.current?.data.name) {
						setName(liveQuery.result.data.name)
					}
					// todo: I don't think this array comparison will work, might need to "diff" it instead?
					if (latestTags.current.length === 0 || latestTags.current === latestContent.current?.data.tags) {
						setTags(liveQuery.result.data.tags)
					}
					if (!latestIsFavourite.current || latestIsFavourite.current === latestContent.current?.data.isFavourite) {
						setIsFavourite(liveQuery.result.data.isFavourite ?? false)
					}

					setContentTypeId(liveQuery.result.data.type)
					setContent(liveQuery.result)
					setFieldStorage(liveQuery.result.data.fields)
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
	}, [options.contentId, currentDatabaseId])

	useEffect(() => {
		latestName.current = name
	}, [name]);

	useEffect(() => {
		latestTags.current = tags
	}, [tags]);

	useEffect(() => {
		latestContent.current = content
	}, [content])

	useEffect(() => {
		latestIsFavourite.current = isFavourite
	}, [isFavourite])

	useEffect(() => {
		latestFieldStorage.current = fieldStorage
	}, [fieldStorage])

	const setField = useCallback((id: string, value: FieldValues) => {
		const updatedFields = {
			...latestFieldStorage.current,
		}
		updatedFields[id] = value
		setFieldStorage(updatedFields)
	}, [])

	return {
		contentTypeId,
		contentType,
		name,
		setName,
		tags,
		setTags,
		isFavourite,
		setIsFavourite,
		fieldStorage,
		setField,
	}
}
