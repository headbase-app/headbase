import {createContext, useContext} from "solid-js";
import type {IFilesAPI} from "../02-apis/files/files.api";

export const FilesAPIContext = createContext<IFilesAPI>();

export function useFilesAPI() {
	const context = useContext(FilesAPIContext)
	if (!context) {
		throw new Error("FilesAPI context requested but no value was provided.")
	}

	return context
}
