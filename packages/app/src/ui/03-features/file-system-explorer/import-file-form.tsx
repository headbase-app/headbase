import {createSignal} from "solid-js";
import {useFilesAPI} from "@/framework/files.context.ts";
import {useCurrentVault} from "@/framework/use-current-vault.ts";

export interface ImportFileProps {
	onClose: () => void;
}

export function ImportFileForm(props: ImportFileProps) {
	const filesAPI = useFilesAPI()
	const currentVault  = useCurrentVault()

	const [file, setFile] = createSignal<File | null>(null);
	const [uploadPath, setUploadPath] = createSignal<string>("");
	let fileInput!: HTMLInputElement;

	function reset() {
		setFile(null);
		// todo: can file input be controlled via signal?
		fileInput.value = ""
		setUploadPath("");
	}

	function onClose() {
		reset();
		props.onClose();
	}

	function onInput(e: InputEvent & {target: HTMLInputElement}) {
		const files: FileList | null = e.target.files;
		if (files) {
			const file = files.item(0)
			if (file) {
				setFile(file);
				setUploadPath(file.name)
			}
		}
	}

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()

		if (currentVault.status !== 'success' || !currentVault.result) {
			throw new Error("Attempted to upload file with no open vault.")
		}

		const uploadFile = file()
		const targetLocation = uploadPath()

		if (uploadFile && targetLocation) {
			// todo: possible to write via stream so file doesn't need to be fully loaded into memory?
			const buffer = await uploadFile.arrayBuffer()
			await filesAPI.write(currentVault.result.id, targetLocation, buffer)

			reset()
		}
	}

	return (
		<form onSubmit={onSubmit}>
			<h3>Import File</h3>
			<div>
				<label for="upload-file">File</label>
				<input
					id="upload-file"
					type="file"
					placeholder="upload file..."
					onInput={onInput}
					ref={fileInput}
				/>
			</div>
			<div>
				<label for="path">Upload Path</label>
				<textarea
					rows="5"
					placeholder="/path/to/upload"
					value={uploadPath()}
					onInput={(e) => {setUploadPath(e.target.value)}}
				/>
				<p>Entering an existing path with overwrite any existing file!</p>
			</div>
			<div>
				<button type="submit">Upload</button>
			</div>
			<button onClick={onClose} type="button">Close</button>
		</form>
	)
}
