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
import {SettingsDialog, SettingsDialogProvider} from "../../patterns/features/settings/settings-dialog.tsx";
import {Workspace} from "../../patterns/features/workspace/workspace.tsx";
import {HeadbaseWeb} from "../../logic/headbase-web.ts";

const headbase = new HeadbaseWeb()

export function MainPage() {
	const [isMenuPanelOpen, setIsMenuPanelOpen] = useState<boolean>(true)

	return (
		<HeadbaseContextProvider headbase={headbase}>
			<WorkspaceContextProvider>
				<DatabaseManagerDialogProvider>
						<StatusDialogProvider>
								<SettingsDialogProvider>
									<main className="headbase">
										<DatabaseManagerDialog/>

										<MenuPanel isMenuPanelOpen={isMenuPanelOpen}
											setIsMenuPanelOpen={setIsMenuPanelOpen}/>
										<Workspace isMenuPanelOpen={isMenuPanelOpen}
											setIsMenuPanelOpen={setIsMenuPanelOpen}/>

										<StatusDialog/>
										<SettingsDialog/>
									</main>
								</SettingsDialogProvider>
						</StatusDialogProvider>
				</DatabaseManagerDialogProvider>
			</WorkspaceContextProvider>
		</HeadbaseContextProvider>
	);
}
