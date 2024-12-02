import {JButton, JErrorText, JProse} from "@ben-ryder/jigsaw-react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {useEffect, useRef, useState} from "react";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import {useDatabase} from "../../../logic/react/databases/use-database.tsx";
import {LiveQueryStatus} from "../../../logic/control-flow.ts";

const ExportForm = z.object({})
type ExportForm = z.infer<typeof ExportForm>

// todo: update to allow exporting any unlocked database>
export function ExportDatabase() {
	const { headbase, currentDatabaseId } = useHeadbase()
	const databaseQuery = useDatabase(currentDatabaseId)

	const { handleSubmit, setError, formState: {errors, isSubmitting} } = useForm<ExportForm>({})

	const [downloadUrl, setDownloadUrl] = useState<string|undefined>()
	const downloadRef = useRef<HTMLAnchorElement>(null)

	async function onExport() {
		if (!currentDatabaseId || !(databaseQuery.status === LiveQueryStatus.SUCCESS) || !headbase) {
			return setError('root', { message: 'No current database active, so unable to export.' })
		}

		try {
			//const exportData = await headbase.db.export(currentDatabaseId)
			// const fileContent = JSON.stringify(exportData)
			// const downloadFile = new File([fileContent], `${databaseQuery.result.name} - export.json`, {type: 'application/json'})
			// const downloadURL = URL.createObjectURL(downloadFile)
			// setDownloadUrl(downloadURL)
			throw new Error("not implemented yet")
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

	return (
		<form onSubmit={handleSubmit(onExport)}>
			<h2>Export</h2>
			<JProse>
				<p>
					Use this feature to export your currently open database as a <code>.json</code> file.<br/>
					The export process make take a while if you have lots of content, so make sure not to close this dialog
					while the export is running otherwise you'll have to start again.
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
	)
}
