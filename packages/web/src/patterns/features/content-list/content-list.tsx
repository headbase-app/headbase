import {ErrorCallout} from "../../patterns/components/error-callout/error-callout";
import {useWorkspaceContext} from "../workspace/workspace-context";
import {ContentCard} from "../../patterns/components/content-card/content-card";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContentQuery} from "@headbase-toolkit/react/use-content-query";

export interface SearchProps {
	onOpen?: () => void
}


export function ContentList(props: SearchProps) {
	const {currentDatabaseId} = useHeadbase()
	const { openTab } = useWorkspaceContext()
	const queryResult = useContentQuery(currentDatabaseId, {
		table: 'content',
		// index: {
		//     field: 'type',
		//     operation: 'includes',
		//     value: ['task-type-id', 'note-type-id']
		// },
		whereCursor: (localEntity, version) => {
			return true
		},
		whereData: (entityDto) => {
			return true
		},
		sort: (dtos) => {
			return dtos
		}
	})

	if (queryResult.status === 'loading') {
		return <p>Loading...</p>
	}
	if (queryResult.status === 'error') {
		return <ErrorCallout errors={queryResult.errors} />
	}

	return (
		<div>
			{queryResult.result.length > 0
				? (
					<ul>
						{queryResult.result.map(content => (
							<ContentCard
								key={content.id}
								id={content.id}
								name={content.data.name}
								onSelect={() => {
									openTab({type: "content", contentId: content.id}, {switch: true})
									if (props.onOpen) {
										props.onOpen()
									}
								}}
							/>
						))}
					</ul>
				)
				: (
					<p>Not Content Found</p>
				)
			}
		</div>
	)
}
