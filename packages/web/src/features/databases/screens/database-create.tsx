import {DatabaseBasicDataForm} from "../forms/database-basic-data-form";
import {useCallback, useState} from "react";
import {LocalDatabaseFields} from "@headbase-toolkit/types/database";
import {DatabasePasswordForm} from "../forms/database-password-form";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";

export type DatabaseCreateSteps = 'basic-info' | 'encryption'

export function DatabaseCreateScreen() {
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const [currentStep, setCurrentStep] = useState<DatabaseCreateSteps>('basic-info')
	const [basicInfo, setBasicInfo] = useState<LocalDatabaseFields | undefined>(undefined)

	const { createDatabase } = useHeadbase()

	const onBasicInfoNext = useCallback((basicInfo: LocalDatabaseFields) => {
		setBasicInfo(basicInfo)
		setCurrentStep('encryption')
	}, [])

	const onBack = useCallback(() => {
		setCurrentStep('basic-info')
	}, [])

	const onSave = useCallback(async (password: string) => {
		if (!basicInfo) {
			console.error('No basic info set')
			return
		}

		try {
			await createDatabase({
				name: basicInfo.name,
				syncEnabled: basicInfo.syncEnabled
			}, password)

			setOpenTab({type: 'list'})
		}
		catch (e) {
			console.error(e)
		}

	}, [createDatabase, basicInfo])

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