import {LocalVaultDto} from "@/contracts/vaults";
import {useEffect, useState} from "react";
import {useVaultsService} from "@renderer/services/vaults/vaults.context";
import {SUBSCRIPTION_LOADING_STATE, SubscriptionResult} from "@renderer/utils/subscriptions";

export function useVaults(): SubscriptionResult<LocalVaultDto[]> {
	const { vaultsService } = useVaultsService()
	const [result, setResult] = useState<SubscriptionResult<LocalVaultDto[]>>(SUBSCRIPTION_LOADING_STATE)

	useEffect(() => {
		const subscription = vaultsService.liveGetVaults(setResult)
		return () => {
			subscription.unsubscribe()
		}
	}, [vaultsService])

	return result
}

export type UseCurrentVault = SubscriptionResult<{
	currentVault: LocalVaultDto | null;
	isCurrentVaultLoading: boolean;
}>

export function useCurrentVault(): SubscriptionResult<LocalVaultDto|null> {
	const { vaultsService } = useVaultsService()
	const [result, setResult] = useState<SubscriptionResult<LocalVaultDto|null>>(SUBSCRIPTION_LOADING_STATE)

	useEffect(() => {
		const subscription = vaultsService.liveGetCurrentVault(setResult)
		return () => {
			subscription.unsubscribe()
		}
	}, [vaultsService])

	return result
}

export interface UseVault {
	vault: LocalVaultDto | null;
	isVaultLoading: boolean;
}

export function useVault(vaultId: string): SubscriptionResult<LocalVaultDto|null> {
	const { vaultsService } = useVaultsService()
	const [result, setResult] = useState<SubscriptionResult<LocalVaultDto|null>>(SUBSCRIPTION_LOADING_STATE)

	useEffect(() => {
		const subscription = vaultsService.liveGetVault(vaultId, setResult)
		return () => {
			subscription.unsubscribe()
		}
	}, [vaultId, vaultsService])

	return result
}
