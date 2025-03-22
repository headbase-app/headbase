import {useObjectQuery} from "../../../logic/react/tables/use-object-query.tsx";
import {JErrorText} from "@ben-ryder/jigsaw-react";
import {useWorkspaceContext} from "../workspace/workspace-context.tsx";

export function FavouritesList() {
	const { openTab } = useWorkspaceContext()
	const objects = useObjectQuery()

	if (objects.status === 'loading') {
		return <p>Loading...</p>
	}

	if (objects.status === 'error') {
		return <JErrorText>An unexpected error occurred.</JErrorText>
	}

	return (
		<div>
			{objects.result.length === 0 && (
				<p>No favorites found</p>
			)}
			{objects.result.map(object => (
				<div key={object.id}>
					<button
						onClick={() => openTab({type: 'object', objectId: object.id})}
					>{typeof object.data?.title === 'string' ? object.data.title : object.id}</button>
				</div>)
			)}
		</div>
	)
}