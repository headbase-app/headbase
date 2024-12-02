import {useWorkspaceContext} from "../workspace/workspace-context";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import {useContentItemQuery} from "../../../logic/react/tables/use-item-query.tsx";
import {ErrorCallout} from "../../components/error-callout/error-callout.tsx";
import {ContentCard} from "../../components/content-card/content-card.tsx";

export interface SearchProps {
	onOpen?: () => void
}


export function ContentList(props: SearchProps) {
	const { openTab } = useWorkspaceContext()
	const query = useContentItemQuery({filter: {isDeleted: false}})

	if (query.status === 'loading') {
		return <p>Loading...</p>
	}
	if (query.status === 'error') {
		return <ErrorCallout errors={query.errors} />
	}

	return (
		<div>
			{query.result.length > 0
				? (
					<ul>
						{query.result.map(content => (
							<ContentCard
								key={content.id}
								id={content.id}
								name={content.name}
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
