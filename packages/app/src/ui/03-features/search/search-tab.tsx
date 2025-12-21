import {For, Show} from "solid-js";
import {useObjectsQuery} from "@/framework/use-objects-query.ts";
import {useWorkspace} from "@/framework/workspace/workspace.context.ts";
import type {BaseTabProps} from "@ui/03-features/workspace/workspace-tab.tsx";

export function SearchTab(_props: BaseTabProps) {
	const DEFAULT_QUERY = {where: {type: {$notEqual: "https://headbase.app/v1/type"}}}
	const objectsQuery = useObjectsQuery(DEFAULT_QUERY)
	const { openTab } = useWorkspace()

	return (
		<div>
			<Show when={objectsQuery().status === 'loading'}>
				<p>Loading objects...</p>
			</Show>
			<Show
				when={(() => {
					const query= objectsQuery(); return query.status === 'error' ? query : false
				})()} keyed
			>
				{(query) => (
					<>
						<p>An error occurred</p>
						<p>{query.errors.join(",")}</p>
					</>
				)}
			</Show>
			<Show
				when={(() => {
					const query= objectsQuery(); return query.status === 'success' ? query.result : false
				})()} keyed
			>
				{(objects) => (
					<div>
						<Show when={objects.length === 0}>
							<p>No objects found</p>
						</Show>
						<For each={objects}>
							{(object) => (
								<div>
									<p>[<b>{object.type}</b>]: {object.id} | {JSON.stringify(object.fields)}</p>
									<button onClick={() => {openTab({type: "object", objectId: object.id})}}>open</button>
								</div>
							)}
						</For>
					</div>
				)}
			</Show>
		</div>
	)
}
