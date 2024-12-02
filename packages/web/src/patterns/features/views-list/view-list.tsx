import {useWorkspaceContext} from "../workspace/workspace-context";
import {useViewQuery} from "../../../logic/react/tables/use-view-query.tsx";
import {LiveQueryStatus} from "../../../logic/control-flow.ts";
import {ErrorCallout} from "../../components/error-callout/error-callout.tsx";
import {ContentCard} from "../../components/content-card/content-card.tsx";

export interface ViewListProps {
	onOpen?: () => void
}

export function ViewList(props: ViewListProps) {
	const { openTab } = useWorkspaceContext()

	const contentQuery = useViewQuery({filter: {isDeleted: false}});

	if (contentQuery.status === LiveQueryStatus.LOADING) {
		return <p>Loading...</p>
	}
	if (contentQuery.status === LiveQueryStatus.ERROR) {
		return <ErrorCallout errors={contentQuery.errors} />
	}

	return (
		<div>
			{contentQuery.result.length > 0
				? (
					<ul>
						{contentQuery.result.map(view => (
							<ContentCard
								key={view.id}
								id={view.id}
								name={view.name}
								description={view.description}
								onSelect={() => {
									openTab({type: "view", viewId: view.id})
									if (props.onOpen) {
										props.onOpen()
									}
								}}
							/>
						))}
					</ul>
				)
				: (
					<p>No Views Found</p>
				)
			}
		</div>
	)
}
