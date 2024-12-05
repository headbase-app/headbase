import {WithTabData} from "../../workspace/workspace";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {JButton} from "@ben-ryder/jigsaw-react";
import {useEffect, useState} from "react";

import "./view-tab.scss"
import {useView} from "../../../../logic/react/tables/use-view.tsx";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import {ContentItemDto} from "../../../../logic/schemas/content-items/dtos.ts";
import {LiveQueryStatus} from "../../../../logic/control-flow.ts";
import {ErrorCallout} from "../../../components/error-callout/error-callout.tsx";
import {ContentCard} from "../../../components/content-card/content-card.tsx";

export interface ViewTabProps extends WithTabData {
	viewId: string
}

export function ViewTab(props: ViewTabProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const { openTab, setTabName } = useWorkspaceContext()
	const viewQuery = useView(props.viewId)

	useEffect(() => {
		if (viewQuery.status === 'success') {
			setTabName(props.tabIndex, viewQuery.result.name)
		}
	}, [viewQuery.status]);

	const [results, setResults] = useState<ContentItemDto[]>([])

	/**
	 * A hook to set and load the content based on the viewQuery result
	 */
	useEffect(() => {
		if (!headbase) return

		if (viewQuery.status === 'loading' || viewQuery.status === 'error') {
			setResults([])
		}

		const resultsQuery = headbase.db.liveQueryItems({filter: {isDeleted: false}})

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
				<h3 className='view__title'>{viewQuery.result.name}</h3>
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
								// remove description field from content card, or make optional?
								<ContentCard key={result.id} id={result.id} name={result.name} description={null} onSelect={() => {
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
