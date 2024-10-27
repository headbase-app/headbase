import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../state/headbase";
import {ErrorCallout} from "../../patterns/components/error-callout/error-callout";
import {useWorkspaceContext} from "../workspace/workspace-context";
import {ContentCard} from "../../patterns/components/content-card/content-card";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import {useContentQuery} from "@headbase-toolkit/react/use-content-query";

export interface ViewListProps {
	onOpen?: () => void
}

export function ViewList(props: ViewListProps) {
	const {currentDatabaseId} = useHeadbase<HeadbaseTableTypes, HeadbaseTableSchemas>()
	const { openTab } = useWorkspaceContext()

	const contentQuery = useContentQuery(currentDatabaseId, {
		table: 'views',
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
								name={view.data.name}
								description={view.data.description}
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
