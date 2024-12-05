import React, {useState} from "react";

import "./main.scss"
import {MenuPanel} from "../../patterns/layout/menu-panel/menu-panel";
import { HeadbaseContextProvider } from "../../logic/react/use-headbase";
import {WorkspaceContextProvider} from "../../patterns/features/workspace/workspace-context.tsx";
import {
	DatabaseManagerDialog,
	DatabaseManagerDialogProvider
} from "../../patterns/features/databases/manager/database-manager.tsx";
import {NewContentDialog, NewContentDialogProvider} from "../../patterns/features/new-content/new-content-dialog.tsx";
import {StatusDialog, StatusDialogProvider} from "../../patterns/features/status/status-dialog.tsx";
import {SearchDialog, SearchDialogProvider} from "../../patterns/features/search/dialog/search-dialog.tsx";
import {
	DataStructureDialog,
	DataStructureDialogProvider
} from "../../patterns/features/data-structure/data-structure-dialog.tsx";
import {ViewsDialog, ViewsDialogProvider} from "../../patterns/features/views/dialog/views-dialog.tsx";
import {
	ContentListDialog,
	ContentListDialogProvider
} from "../../patterns/features/content-list/dialog/content-list-dialog.tsx";
import {AccountDialog, AccountDialogProvider} from "../../patterns/features/account/account-dialog.tsx";
import {Workspace} from "../../patterns/features/workspace/workspace.tsx";


export function MainPage() {
	const [isMenuPanelOpen, setIsMenuPanelOpen] = useState<boolean>(true)

	return (
		<HeadbaseContextProvider>
			<WorkspaceContextProvider>
				<DatabaseManagerDialogProvider>
					<NewContentDialogProvider>
						<StatusDialogProvider>
							<SearchDialogProvider>
								<DataStructureDialogProvider>
									<ViewsDialogProvider>
										<ContentListDialogProvider>
											<AccountDialogProvider>
												<main className="headbase">
													<DatabaseManagerDialog/>

													<MenuPanel isMenuPanelOpen={isMenuPanelOpen}
														setIsMenuPanelOpen={setIsMenuPanelOpen}/>
													<Workspace isMenuPanelOpen={isMenuPanelOpen}
														setIsMenuPanelOpen={setIsMenuPanelOpen}/>

													<NewContentDialog/>
													<StatusDialog/>
													<SearchDialog/>
													<DataStructureDialog/>
													<ViewsDialog/>
													<ContentListDialog/>
													<AccountDialog/>
												</main>
											</AccountDialogProvider>
										</ContentListDialogProvider>
									</ViewsDialogProvider>
								</DataStructureDialogProvider>
							</SearchDialogProvider>
						</StatusDialogProvider>
					</NewContentDialogProvider>
				</DatabaseManagerDialogProvider>
			</WorkspaceContextProvider>
		</HeadbaseContextProvider>
	);
}
