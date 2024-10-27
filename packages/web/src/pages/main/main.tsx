import React, {useState} from "react";

import "./main.scss"
import {WorkspaceContextProvider} from "../../features/workspace/workspace-context";
import {Workspace} from "../../features/workspace/workspace";
import {MenuPanel} from "../../patterns/layout/menu-panel/menu-panel";
import {NewContentDialog, NewContentDialogProvider} from "../../features/new-content/new-content-dialog";
import {StatusDialog, StatusDialogProvider} from "../../features/status/status-dialog";
import {SearchDialog, SearchDialogProvider} from "../../features/search/dialog/search-dialog";
import {DataStructureDialog, DataStructureDialogProvider} from "../../features/data-structure/data-structure-dialog";
import { ViewsDialog, ViewsDialogProvider } from "../../features/views/dialog/views-dialog";
import {ContentListDialog, ContentListDialogProvider} from "../../features/content-list/dialog/content-list-dialog";
import {HeadbaseTableSchemas} from "../../state/headbase";
import {DatabaseManagerDialog, DatabaseManagerDialogProvider} from "../../features/databases/manager/database-manager";
import {AccountDialog, AccountDialogProvider} from "../../features/account/account-dialog";
import {HeadbaseContextProvider} from "@headbase-toolkit/react/use-headbase";

export function MainPage() {
	const [isMenuPanelOpen, setIsMenuPanelOpen] = useState<boolean>(true)

	return (
		<HeadbaseContextProvider tableSchemas={HeadbaseTableSchemas}>
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
