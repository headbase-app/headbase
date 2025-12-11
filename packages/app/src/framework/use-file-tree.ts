import {createStore} from "solid-js/store";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@contracts/query.ts";
import type {FileSystemDirectory} from "@api/files/files.interface.ts";
import {createComputed} from "solid-js";
import {useCurrentVault} from "@/framework/use-current-vault.ts";
import {useFilesAPI} from "@/framework/files.context.ts";

export function useFileTree() {
	const currentVault = useCurrentVault()
	const filesApi = useFilesAPI()

	const [fileTree, setFileTree] = createStore<LiveQueryResult<FileSystemDirectory | null>>(structuredClone(LIVE_QUERY_LOADING_STATE))

	/**
	 * 'currentSubscriptionId' used to ensure old liveTree subscriptions don't update the store once they are stale.
	 * todo: feels like a solution to using Solid signal primitives wrong?
	 */
	let currentSubscriptionId: string
	createComputed<(() => void) | null>((previousSubscription) => {
		previousSubscription?.()

		if (currentVault.status === 'success' && currentVault.result) {
			const subscriptionId = window.crypto.randomUUID()
			currentSubscriptionId = subscriptionId
			const subscription = filesApi.liveTree(currentVault.result.id, (result) => {
				if (subscriptionId === currentSubscriptionId) {
					setFileTree(result)
				}
			})

			return () => {subscription.unsubscribe()}
		}

		return null;
	})

	return fileTree
}
