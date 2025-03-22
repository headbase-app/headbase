import React, {useState} from "react";

import "./main.scss"
import {MenuPanel} from "../../patterns/layout/menu-panel/menu-panel";
import { HeadbaseContextProvider } from "../../logic/react/use-headbase";
import {WorkspaceContextProvider} from "../../patterns/features/workspace/workspace-context.tsx";
import {
	DatabaseManagerDialog,
	DatabaseManagerDialogProvider
} from "../../patterns/features/databases/manager/database-manager.tsx";
import {StatusDialog, StatusDialogProvider} from "../../patterns/features/status/status-dialog.tsx";
import {AccountDialog, AccountDialogProvider} from "../../patterns/features/account/account-dialog.tsx";
import {Workspace} from "../../patterns/features/workspace/workspace.tsx";


export function MainPage() {
	const [isMenuPanelOpen, setIsMenuPanelOpen] = useState<boolean>(true)

	return (
		<HeadbaseContextProvider>
			<WorkspaceContextProvider>
				<DatabaseManagerDialogProvider>
						<StatusDialogProvider>
								<AccountDialogProvider>
									<main className="headbase">
										<DatabaseManagerDialog/>

										<MenuPanel isMenuPanelOpen={isMenuPanelOpen}
											setIsMenuPanelOpen={setIsMenuPanelOpen}/>
										<Workspace isMenuPanelOpen={isMenuPanelOpen}
											setIsMenuPanelOpen={setIsMenuPanelOpen}/>

										<StatusDialog/>
										<AccountDialog/>
									</main>
								</AccountDialogProvider>
						</StatusDialogProvider>
				</DatabaseManagerDialogProvider>
			</WorkspaceContextProvider>
		</HeadbaseContextProvider>
	);
}
