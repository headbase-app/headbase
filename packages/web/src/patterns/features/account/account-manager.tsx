import { ReactNode, useState } from "react";
import { AttachmentsManagerPage } from "../attachments/manager/attachments-manager";
import { JButton, JButtonGroup } from "@ben-ryder/jigsaw-react";
import {PerformanceManager} from "../performance/performance-manager";
import {ImportExportManager} from "../import-export/import-export-manager";
import {UserManager} from "../user/user-manager";

export type AccountTabs = "account" | "settings" | "attachments" | "performance" | "import-export"

export function AccountManager() {
	const [currentTab, setCurrentTab] = useState<AccountTabs>("account")

	let content: ReactNode
	if (currentTab === "account") {
		content = <UserManager />
	}
	else if (currentTab === "settings") {
		content = <p>Settings</p>
	}
	else if (currentTab === "attachments") {
		content = <AttachmentsManagerPage />
	}
	else if (currentTab === "performance") {
		content = <PerformanceManager />
	}
	else if (currentTab === "import-export") {
		content = <ImportExportManager />
	}
	else {
		content = <p>Tab Not Found: {currentTab}</p>
	}

	return (
		<div>
			<JButtonGroup align="left">
				<JButton onClick={() => setCurrentTab("account")}>Account</JButton>
				<JButton onClick={() => setCurrentTab("settings")}>Settings</JButton>
				<JButton onClick={() => setCurrentTab("attachments")}>Manage Attachments</JButton>
				<JButton onClick={() => setCurrentTab("import-export")}>Import/Export</JButton>
				<JButton onClick={() => setCurrentTab("performance")}>Device Benchmark</JButton>
			</JButtonGroup>

			<div>
				{content}
			</div>
		</div>
	)
}
