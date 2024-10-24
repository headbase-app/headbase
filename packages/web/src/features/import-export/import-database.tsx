import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useRef} from "react";
import {JButton, JErrorText, JInput} from "@ben-ryder/jigsaw-react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {HeadbaseError} from "@headbase-toolkit/control-flow";

const ImportForm = z.object({
	file: z.string(),
})
type ImportForm = z.infer<typeof ImportForm>

export function ImportDatabase() {
	const { currentDatabase } = useHeadbase()

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

	async function onImport() {
		if (!currentDatabase) {
			return setError('root', { message: 'No current database active, so unable to import.' })
		}

		if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files?.length === 0) {
			return setError('root', { message: 'There appears to be an issue with your upload. Please try again.' })
		}

		const file = fileInputRef.current.files.item(0)
		if (!file) {
			return setError('root', { message: 'There appears to be an issue with your upload. Please try again.' })
		}

		const fileContent = await file.arrayBuffer()
		const fileText = new TextDecoder().decode(fileContent)

		let importData
		try {
			importData = JSON.parse(fileText)
		}
		catch (e) {
			return setError('root', { message: 'Your file contains unexpected data.' })
		}

		try {
			await currentDatabase.import(importData)
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

	return (
		<form onSubmit={handleSubmit(onImport)}>
			<h2>Import</h2>
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
	)
}
