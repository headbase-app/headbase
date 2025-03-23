import {useObjectQuery} from "../../../logic/react/tables/use-object-query.tsx";
import {JErrorText} from "@ben-ryder/jigsaw-react";
import {useWorkspaceContext} from "../workspace/workspace-context.tsx";
import {DataObject} from "../../../logic/services/database/transactions/types.ts";
import {useEffect, useState} from "react";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import {LiveQueryResult} from "../../../logic/control-flow.ts";

export function FavouritesList() {
	const { openTab } = useWorkspaceContext()
	const {currentDatabaseId, headbase} = useHeadbase()

	const [favorites, setFavorites] = useState<LiveQueryResult<DataObject[]>>({status: "loading"})
	const [error, setError] = useState<string>()
	const settings = useObjectQuery({
		where: {"type": {$equal: "https://spec.headbase.app/v1/app/settings"}}
	})

	useEffect(() => {
		if (!headbase || !currentDatabaseId) return
		if (settings.status === "loading") return

		if (settings.status === 'error') {
			console.error(settings.errors)
			setError("An error occurred while loading the app settings")
			setFavorites({status: "error", errors: []})
			return;
		}

		console.debug(settings)

		// todo: validate type of sidebarQuery prop?
		if (settings.result.length === 0 || !settings.result[0].data?.sidebarQuery) {
			setError("Create a settings object (type https://spec.headbase.app/v1/app/settings) with the property 'sidebarQuery' to display objects here")
			setFavorites({status: "error", errors: []})
			return;
		}

		const favoritesQuery = headbase.db.objectStore.liveQuery(
			currentDatabaseId,
			settings.result[0].data.sidebarQuery
			)

		const subscription = favoritesQuery.subscribe(result => {
			setFavorites(result)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [settings.status]);

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
						onClick={() => openTab({type: 'object', objectId: object.id})}
					>{typeof object.data?.title === 'string' ? object.data.title : object.id}</button>
				</div>)
			)}
		</div>
	)
}