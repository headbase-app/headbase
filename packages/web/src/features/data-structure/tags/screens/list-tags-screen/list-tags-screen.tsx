import { JPillButton } from "@ben-ryder/jigsaw-react";
import "./list-tags-screen.scss";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import { ErrorCallout } from "../../../../../patterns/components/error-callout/error-callout";
import {
	GenericManagerScreenProps
} from "../../../../../common/generic-manager/generic-manager";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContentQuery} from "@headbase-toolkit/react/use-content-query";


export function ListTagsScreen(props: GenericManagerScreenProps) {
	const {currentDatabaseId} = useHeadbase()
	const tags = useContentQuery(currentDatabaseId, {table: "tags"})

	return (
		<>
			<div className="tags-list">
				{tags.status === LiveQueryStatus.ERROR && <ErrorCallout errors={tags.errors} />}
				<div className="tags-list__list">
					<JPillButton
						onClick={() => {
							props.navigate({screen: "new"})
						}}
						style={{fontWeight: "bold"}}
					>
						Create New Tag
					</JPillButton>
					{tags.status === LiveQueryStatus.SUCCESS && tags.result.map((tag) => (
						<JPillButton
							onClick={() => {
								props.navigate({screen: "edit", id: tag.id})
							}}
							key={tag.id}
							variant={tag.data.colourVariant || undefined}
						>{tag.data.name}</JPillButton>
					))}
				</div>
			</div>
		</>
	);
}
