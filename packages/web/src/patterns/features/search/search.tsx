import {useWorkspaceContext} from "../workspace/workspace-context";
import {ContentCard} from "../../components/content-card/content-card.tsx";
import {useEffect, useState} from "react";
import {OPFSXFile} from "opfsx";
import {useHeadbase} from "../../../headbase/hooks/use-headbase.tsx";

export interface SearchProps {
	onOpen?: () => void
}

export function Search(props: SearchProps) {
	const { currentDatabaseId, headbase } = useHeadbase()
	const { openTab } = useWorkspaceContext()
	const [files, setFiles] = useState<OPFSXFile[]>([])

	useEffect(() => {
		async function load() {
			if (!currentDatabaseId) return
			const files = await headbase.fileSystem.query(currentDatabaseId)
			setFiles(files)
		}
		load()
	}, [headbase, currentDatabaseId]);

	return (
		<div>
			{files?.length > 0
				? (
					<ul>
						{files.map(file => (
							<ContentCard
								key={file.path}
								id={file.path}
								name={file.name.replace(".md", "")}
								description={file.path}
								onSelect={() => {
									openTab({type: "file", path: file.path}, {switch: true})
									if (props.onOpen) {
										props.onOpen()
									}
								}}
							/>
						))}
					</ul>
				)
				: (
					<p>No Files Found</p>
				)
			}
		</div>
	)
}
