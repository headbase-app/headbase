import {useCallback, useEffect, useRef, useState} from "react";
import {JArrowButton, JButton, JErrorText, JProse} from "@ben-ryder/jigsaw-react";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import {useDatabase} from "../../../../logic/react/databases/use-database.tsx";
import {LiveQueryStatus} from "../../../../logic/control-flow.ts";
import {ErrorCallout} from "../../../components/error-callout/error-callout.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";


export interface DatabaseExportScreenProps {
	databaseId: string
}

const ExportForm = z.object({})
type ExportForm = z.infer<typeof ExportForm>


export function DatabaseExportScreen(props: DatabaseExportScreenProps) {
	const { setOpenTab } = useDatabaseManagerDialogContext()
	const {headbase, currentDatabaseId} = useHeadbase()
	const databaseQuery = useDatabase(props.databaseId)

	const [downloadUrl, setDownloadUrl] = useState<string|undefined>()
	const downloadRef = useRef<HTMLAnchorElement>(null)
	const { handleSubmit, setError, formState: {errors, isSubmitting} } = useForm<ExportForm>({})

	const onExport = async () => {
		if (!headbase) return setError('root', { message: 'Headbase not found.' })
		if (!currentDatabaseId || databaseQuery.status !== "success") return setError('root', { message: 'Unable to export database as its not been loaded.' })
		if (!databaseQuery.result.isUnlocked) return setError('root', { message: 'Unable to export database which is not unlocked.' })

		try {
			const exportData = await headbase.db.migration.export()
			const fileContent = JSON.stringify(exportData)
			const downloadFile = new File([fileContent], `${databaseQuery.result.name}.json`, {type: 'application/json'})
			const downloadURL = URL.createObjectURL(downloadFile)
			setDownloadUrl(downloadURL)
		}
		catch (e) {
			console.error(e)
			setError('root', { message: 'An unexpected error occurred.' })
		}

	}

	// Trigger an automatic download once the URL becomes available.
	const hasDownloaded = useRef<boolean>(false)
	useEffect(() => {
		if (downloadRef.current && !hasDownloaded.current) {
			downloadRef.current.click()
			hasDownloaded.current = true
		}
	}, [downloadUrl]);

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
				<h2>Export Database {databaseQuery.result.name}</h2>
			</div>
			<form onSubmit={handleSubmit(onExport)}>
				<JProse>
					<p>
						Use this feature to export your database as a <code>.json</code> file.<br/>
						The export process make take a while if you have lots of content, so make sure not to close this dialog
						while the export is running otherwise you'll likely have to start again.
					</p>
				</JProse>
				<div>
					<JButton
						type='submit'
						onClick={onExport}
						disabled={isSubmitting || !!downloadUrl}
						loading={isSubmitting}
					>Export</JButton>
				</div>
				{errors.root?.message && (
					<JErrorText>{errors.root.message}</JErrorText>
				)}
				{downloadUrl && (
					<JProse>
						<p>Your export has finished and should start downloading automatically, if not you can <a ref={downloadRef} href={downloadUrl} download>download now</a>.</p>
					</JProse>
				)}
			</form>
		</div>
	)
}
