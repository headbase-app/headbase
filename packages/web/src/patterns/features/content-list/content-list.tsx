import {useWorkspaceContext} from "../workspace/workspace-context";
import {ErrorCallout} from "../../components/error-callout/error-callout.tsx";
import {ContentCard} from "../../components/content-card/content-card.tsx";
import {useObjectQuery} from "../../../logic/react/tables/use-object-query.tsx";

export interface SearchProps {
	onOpen?: () => void
}


export function ContentList(props: SearchProps) {
	const { openTab } = useWorkspaceContext()
	const query = useObjectQuery()

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
						{query.result.map(object => (
							<ContentCard
								key={object.id}
								id={object.id}
								name={typeof object.data?.title === 'string' ? object.data.title : object.id}
								description={JSON.stringify(object.data)}
								onSelect={() => {
									openTab({type: "object", objectId: object.id}, {switch: true})
									if (props.onOpen) {
										props.onOpen()
									}
								}}
							/>
						))}
					</ul>
				)
				: (
					<p>No Objects Found</p>
				)
			}
		</div>
	)
}
