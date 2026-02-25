import {VaultBasicDataForm} from "../forms/vault-basic-data-form";
import {useCallback, useState} from "react";
import {VaultPasswordForm} from "../forms/vault-password-form";
import {useVaultManagerDialogContext} from "../manager/vault-manager-context";
import {CreateVaultDto} from "@/contracts/vaults";
import {useDependency} from "@framework/dependency.context";

export type VaultCreateSteps = 'basic-info' | 'encryption'

export function VaultCreateScreen() {
	const { setOpenTab } = useVaultManagerDialogContext()

	const [currentStep, setCurrentStep] = useState<VaultCreateSteps>('basic-info')
	const [basicInfo, setBasicInfo] = useState<CreateVaultDto | undefined>(undefined)

	const { vaultsApi } = useDependency()

	const onBasicInfoNext = useCallback((basicInfo: CreateVaultDto) => {
		setBasicInfo(basicInfo)
		setCurrentStep('encryption')
	}, [])

	const onBack = useCallback(() => {
		setCurrentStep('basic-info')
	}, [])

	const onSave = useCallback(async (password: string) => {
		if (!basicInfo || !vaultsApi) {
			console.error('No basic info set or headbase not defined')
			return
		}

		try {
			await vaultsApi.create({
				displayName: basicInfo.displayName,
				path: basicInfo.path,
			})

			setOpenTab({type: 'list'})
		}
		catch (e) {
			console.error(e)
		}

	}, [basicInfo, vaultsApi, setOpenTab])

	return (
		<div>
			{currentStep === 'basic-info' && (
				<VaultBasicDataForm
					saveText='Next Step'
					onSave={onBasicInfoNext}
					initialData={basicInfo}
				/>
			)}
			{currentStep === 'encryption' && (
				<VaultPasswordForm
					saveText='Create Vault'
					onSave={onSave}
					cancelText='Back'
					onCancel={onBack}
				/>
			)}
		</div>
	)
}
