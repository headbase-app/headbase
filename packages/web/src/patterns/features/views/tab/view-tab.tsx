import {WithTabData} from "../../workspace/workspace";
import {LiveQueryStatus} from "@headbase-toolkit/control-flow";
import {ErrorCallout} from "../../../patterns/components/error-callout/error-callout";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {JButton} from "@ben-ryder/jigsaw-react";
import {useEffect, useState} from "react";
import {ContentCard} from "../../../patterns/components/content-card/content-card";

import "./view-tab.scss"
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContent} from "@headbase-toolkit/react/use-content";
import {ContentDto} from "@headbase-toolkit/schemas/entities/content";
import {IndexWhereOption} from "@headbase-toolkit/schemas/query";

export interface ViewTabProps extends WithTabData {
	viewId: string
}

export function ViewTab(props: ViewTabProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const { openTab, setTabName } = useWorkspaceContext()
	const viewQuery = useContent(currentDatabaseId, 'views', props.viewId)

	useEffect(() => {
		if (viewQuery.status === 'success') {
			setTabName(props.tabIndex, viewQuery.result.data.name)
		}
	}, [viewQuery.status]);

	const [results, setResults] = useState<ContentDto[]>([])

	/**
	 * A hook to set and load the content based on the viewQuery result
	 */
	useEffect(() => {
		if (!headbase || !currentDatabaseId) return 

		if (viewQuery.status === 'loading' || viewQuery.status === 'error') {
			setResults([])
		}
		else if (currentDatabaseId) {
			const queryIndex: IndexWhereOption<'content'>|undefined = viewQuery.result.data.queryContentTypes.length > 0 ?
				{
					field: 'type',
					operation: 'includes',
					value: viewQuery.result.data.queryContentTypes
				} : undefined

			const resultsQuery = headbase.tx.liveQuery(currentDatabaseId, {
				table: 'content',
				index: queryIndex,
				whereCursor: (entity, version) => {
					if (viewQuery.result.data.queryTags.length === 0) {
						return true
					}

					for (const tagId of viewQuery.result.data.queryTags) {
						if (!entity.tags.includes(tagId)) {
							return false
						}
					}

					return true
				}
			})

			const resultQuerySubscription = resultsQuery.subscribe((liveQuery) => {
				if (liveQuery.status === LiveQueryStatus.SUCCESS) {
					setResults(liveQuery.result)
				}
				else if (liveQuery.status === 'error') {
					// todo: should output errors to users?
					console.error(liveQuery.errors)
				}
			})

			return () => {
				resultQuerySubscription.unsubscribe()
			}
		}
	}, [viewQuery.status, currentDatabaseId, headbase])

	if (viewQuery.status === LiveQueryStatus.LOADING) {
		return (
			<p>Loading...</p>
		)
	}

	if (viewQuery.status === LiveQueryStatus.ERROR) {
		return (
			<ErrorCallout errors={viewQuery.errors} />
		)
	}

	return (
		<div className='view'>
			{viewQuery.errors && <ErrorCallout errors={viewQuery.errors} />}
			<div className='view__header'>
				<h3 className='view__title'>{viewQuery.result.data.name}</h3>
				<JButton
					variant='secondary'
					onClick={() => {
						openTab({type: 'view_edit', viewId: props.viewId})
					}}
				>Edit</JButton>
			</div>
			<div className='view__display'>
				<div className='view-display-list'>
					{results.length > 0 &&
						<ul>
							{results.map(result => (
								<ContentCard key={result.id} id={result.id} name={result.data.name} onSelect={() => {
									openTab({type: 'content', contentId: result.id})
								}} />
							))}
						</ul>
					}
				</div>
			</div>
		</div>
	)
}
