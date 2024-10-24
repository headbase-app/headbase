import {useObservableQuery} from "@headbase-toolkit/react/use-observable-query";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../state/headbase-localful";
import {ErrorCallout} from "../../patterns/components/error-callout/error-callout";
import {useWorkspaceContext} from "../workspace/workspace-context";
import {ContentCard} from "../../patterns/components/content-card/content-card";
import {useLocalful} from "@headbase-toolkit/react/use-localful";

export interface SearchProps {
	onOpen?: () => void
}

export function ContentList(props: SearchProps) {
	const {currentDatabase} = useLocalful<HeadbaseTableTypes, HeadbaseTableSchemas>()
	const { openTab } = useWorkspaceContext()

	const contentQuery = useObservableQuery(currentDatabase?.liveQuery({
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
	}))

	if (contentQuery.status === 'loading') {
		return <p>Loading...</p>
	}
	if (contentQuery.status === 'error') {
		return <ErrorCallout errors={contentQuery.errors} />
	}

	return (
		<div>
			{contentQuery.result.length > 0
				? (
					<ul>
						{contentQuery.result.map(content => (
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
