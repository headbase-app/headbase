import {DatabaseBasicDataForm, DatabaseBasicFields} from "../forms/database-basic-data-form";
import {useCallback, useState} from "react";
import {DatabasePasswordForm} from "../forms/database-password-form";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {useHeadbase} from "../../../../headbase/hooks/use-headbase.tsx";

export type DatabaseCreateSteps = 'basic-info' | 'encryption'

export function DatabaseCreateScreen() {
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const [currentStep, setCurrentStep] = useState<DatabaseCreateSteps>('basic-info')
	const [basicInfo, setBasicInfo] = useState<DatabaseBasicFields | undefined>(undefined)

	const { headbase } = useHeadbase()

	const onBasicInfoNext = useCallback((basicInfo: DatabaseBasicFields) => {
		setBasicInfo(basicInfo)
		setCurrentStep('encryption')
	}, [])

	const onBack = useCallback(() => {
		setCurrentStep('basic-info')
	}, [])

	const onSave = useCallback(async (password: string) => {
		if (!basicInfo || !headbase) {
			console.error('No basic info set or headbase not defined')
			return
		}

		try {
			await headbase.vaults.create({
				name: basicInfo.name,
				syncEnabled: basicInfo.syncEnabled,
				password: password,
			})

			setOpenTab({type: 'list'})
		}
		catch (e) {
			console.error(e)
		}

	}, [headbase, basicInfo])

	return (
		<div>
			{currentStep === 'basic-info' && (
				<DatabaseBasicDataForm
					saveText='Next Step'
					onSave={onBasicInfoNext}
					initialData={basicInfo}
				/>
			)}
			{currentStep === 'encryption' && (
				<DatabasePasswordForm
					saveText='Create Database'
					onSave={onSave}
					cancelText='Back'
					onCancel={onBack}
				/>
			)}
		</div>
	)
}