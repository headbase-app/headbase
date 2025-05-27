import {useRef} from "react";
import {JArrowButton, JButton, JErrorText, JInput} from "@ben-ryder/jigsaw-react";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {ErrorCallout} from "../../../components/error-callout/error-callout.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {useHeadbase} from "../../../../headbase/hooks/use-headbase.tsx";
import {useVault} from "../../../../headbase/hooks/vaults/use-vault.tsx";
import {HeadbaseError, LiveQueryStatus} from "../../../../headbase/control-flow.ts";


export interface DatabaseImportScreenProps {
	databaseId: string
}

const ImportForm = z.object({
	file: z.string(),
})
type ImportForm = z.infer<typeof ImportForm>


export function DatabaseImportScreen(props: DatabaseImportScreenProps) {
	const { setOpenTab } = useDatabaseManagerDialogContext()
	const {headbase, currentDatabaseId} = useHeadbase()
	const databaseQuery = useVault(props.databaseId)

	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const {
		register,
		handleSubmit,
		setError,
		formState: {errors, isSubmitting}
	} = useForm<ImportForm>({
		defaultValues: {
			file: ''
		}
	})
	const {ref: reactHookFormFileInputRef, ...fileInputProps} = register('file')

	const onImport = async () => {
		if (!headbase) return setError('root', { message: 'Headbase not found.' })
		if (!currentDatabaseId || databaseQuery.status !== "success") return setError('root', { message: 'Unable to import to database as its not been loaded.' })
		if (!databaseQuery.result.isUnlocked) return setError('root', { message: 'Unable to import to database which is not unlocked.' })

			if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files?.length === 0) {
				return setError('root', { message: 'There appears to be an issue with your upload. Please try again.' })
			}

			const file = fileInputRef.current.files.item(0)
			if (!file) {
				return setError('root', { message: 'There appears to be an issue with your upload. Please try again.' })
			}

			console.error("Import not implemented yet")
			// const fileContent = await file.arrayBuffer()
			// const fileText = new TextDecoder().decode(fileContent)
			// let importData: DatabaseExport
			// try {
			// 	const fileData = JSON.parse(fileText)
			// 	importData = DatabaseExport.parse(fileData)
			// }
			// catch (e) {
			// 	console.error(e)
			// 	return setError('root', { message: 'Your file contains unexpected data.' })
			// }

			try {
				// await headbase.db.migration.import(importData)
				console.error("Import not implemented yet")

				// todo: show proper success message
				return setError('root', { message: 'Import successful!' })
			}
			catch (e) {
				if (e instanceof HeadbaseError) {
					console.error(e.cause)
				}
				else {
					console.error(e)
				}
				return setError('root', { message: 'Your file was not cleanly imported. Review the browser console for issues.' })
			}
	}

	if (databaseQuery.status === LiveQueryStatus.LOADING) {
		return (
			<p>Loading...</p>
		)
	}

	if (databaseQuery.status === LiveQueryStatus.ERROR) {
		return (
			<ErrorCallout errors={databaseQuery.errors} />
		)
	}

	return (
		<div>
			<div>
				<JArrowButton
					direction='left'
					onClick={() => {
						setOpenTab({type: 'list'})
					}}
				>All databases</JArrowButton>
				<h2>Import Database {databaseQuery.result.name}</h2>
			</div>
			<form onSubmit={handleSubmit(onImport)}>
				<div>
					<JInput
						label="Upload File"
						type="file"
						id="upload"
						accept=".json"
						{...fileInputProps}
						ref={(e) => {
							reactHookFormFileInputRef(e)
							fileInputRef.current = e
						}}
					/>
					<JButton type='submit' disabled={isSubmitting} loading={isSubmitting}>Import</JButton>
					{errors.root?.message && (
						<JErrorText>{errors.root.message}</JErrorText>
					)}
				</div>
			</form>
		</div>
	)
}
