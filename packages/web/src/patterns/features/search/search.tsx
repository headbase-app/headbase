import {useWorkspaceContext} from "../workspace/workspace-context";
import {ContentCard} from "../../components/content-card/content-card.tsx";
import {useEffect, useState} from "react";
import * as opfsx from "opfsx";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import {OPFSFile} from "opfsx";

export interface SearchProps {
	onOpen?: () => void
}

export function Search(props: SearchProps) {
	const { currentDatabaseId } = useHeadbase()
	const { openTab } = useWorkspaceContext()
	const [files, setFiles] = useState<OPFSFile[]>([])

	useEffect(() => {
		async function load() {
			// ensure directory for current vault exists
			await opfsx.mkdir(`/headbase-v1/${currentDatabaseId}`)
			const items = await opfsx.ls(`/headbase-v1/${currentDatabaseId}`, {recursive: true})
			const files = items.filter(item => item.kind === "file")
			setFiles(files)
		}

		if (currentDatabaseId) {
			load()
		}
	}, [currentDatabaseId]);

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
					<p>No Objects Found</p>
				)
			}
		</div>
	)
}
