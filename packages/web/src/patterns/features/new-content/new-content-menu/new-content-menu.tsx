import {JButton} from "@ben-ryder/jigsaw-react";
import {useWorkspaceContext} from "../../workspace/workspace-context";

import "./new-content-menu.scss"
import {useContentTypeQuery} from "../../../../logic/react/tables/use-type-query.tsx";
import {LiveQueryStatus} from "../../../../logic/control-flow.ts";

export interface NewContentMenuProps {
	onOpen?: () => void
}

export function NewContentMenu(props: NewContentMenuProps) {
	const contentTypesQuery = useContentTypeQuery({filter: {isDeleted: false}})
	const { openTab } = useWorkspaceContext()

	return (
		<div className="new-content-menu">
			{contentTypesQuery.status === LiveQueryStatus.SUCCESS &&
						<>
							{contentTypesQuery.result.length > 0
								? (
									<ul className="new-content-menu__list">
										{contentTypesQuery.result.map(type =>
											<li className="new-content-menu__list-item" key={type.id}>
												<JButton
													onClick={() => {
														openTab({type: 'content_new', contentTypeId: type.id}, {switch: true})
														if (props.onOpen) {
															props.onOpen()
														}
													}}
												>{type.name}</JButton></li>
										)}
									</ul>
								)
								: (
									<p>No Content Types Found</p>
								)
							}
						</>
			}
		</div>
	)
}
