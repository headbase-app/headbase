import {JErrorText} from "@ben-ryder/jigsaw-react";
import {useWorkspaceContext} from "../workspace/workspace-context.tsx";
import {DataObject} from "../../../headbase/archive/types.ts";
import {useState} from "react";
import {LiveQueryResult} from "../../../headbase/control-flow.ts";
import {useHeadbase} from "../../../headbase/hooks/use-headbase.tsx";

export function FavouritesList() {
	const { openTab } = useWorkspaceContext()
	const {currentDatabaseId, headbase} = useHeadbase()

	const [favorites, setFavorites] = useState<LiveQueryResult<DataObject[]>>({status: "loading"})
	const [error, setError] = useState<string>()

	if (favorites.status === 'loading') {
		return <p>Loading...</p>
	}

	if (favorites.status === 'error') {
		return <JErrorText>An unexpected error occurred.</JErrorText>
	}

	return (
		<div>
			{favorites.result.length === 0 && (
				<p>No favorites found</p>
			)}
			{favorites.result.map(object => (
				<div key={object.id}>
					<button
						onClick={() => openTab({type: 'file', filePath: object.id})}
					>{typeof object.data?.title === 'string' ? object.data.title : object.id}</button>
				</div>)
			)}
		</div>
	)
}