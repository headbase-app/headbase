import {createSignal, For, Show} from "solid-js";
import type {ObjectVersionDto} from "@api/headbase/types.ts";
import {useHistoryQuery} from "@/framework/use-history-query.ts";
import {useDatabase} from "@/framework/use-database.ts";

export interface ObjectHistoryProps {
	objectId: string
}

export function ObjectHistory(props: ObjectHistoryProps) {
	const database = useDatabase();
	const historyQuery = useHistoryQuery(props.objectId)
	const [activeVersion, setActiveVersion] = createSignal<ObjectVersionDto|null>(null)

	function openVersion(version: ObjectVersionDto) {
		setActiveVersion(version)
	}
	function closeVersion() {
		setActiveVersion(null)
	}
	async function deleteVersion(versionId: string) {
		const db = database()
		if (!db) return

		await db.deleteHistory(versionId, "TODO")
	}

	return (
		<div>
			<div>
				<h2>View version</h2>
				<Show when={!activeVersion()}>
					<p>No version open</p>
				</Show>
				<Show when={activeVersion()} keyed>
					{(version) => (
						<div>
							<button onClick={closeVersion}>close</button>
							<p>Type: {version.type}</p>
							<p>Created At: {version.updatedAt}</p>
							<p>Created By: {version.updatedBy}</p>
							<p>{JSON.stringify(version.fields)}</p>
						</div>
					)}
				</Show>
			</div>
			<div>
				<h2>View history</h2>
				<div>
					<Show when={historyQuery().status === 'loading'}>
						<p>Loading history...</p>
					</Show>
					<Show
						when={(() => {
							const query= historyQuery(); return query.status === 'error' ? query : false
						})()} keyed
					>
						{(query) => (
							<>
								<p>An error occurred loading the history:</p>
								<p>{query.errors.join(",")}</p>
							</>
						)}
					</Show>
					<Show
						when={(() => {
							const query= historyQuery(); return query.status === 'success' ? query.result : false
						})()} keyed
					>
						{(objects) => (
							<div>
								<For each={objects}>
									{(objectVersion) => (
										<div>
											<p>[<b>{objectVersion.type}</b>]: {objectVersion.id} | {JSON.stringify(objectVersion.fields)}</p>
											<button onClick={() => {openVersion(objectVersion)}}>view</button>
											<button onClick={() => {deleteVersion(objectVersion.id)}}>delete</button>
										</div>
									)}
								</For>
							</div>
						)}
					</Show>
				</div>
			</div>
		</div>
	)
}
