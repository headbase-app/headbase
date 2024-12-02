import { ReactNode, useState } from "react";
import { JButton, JButtonGroup } from "@ben-ryder/jigsaw-react";
import { FieldsManager } from "./fields/fields-manager";
import {ContentTypesManager} from "./content-types/content-types-manager";

export type DataStructureTabs = "content-types" | "fields"

export function DataStructureManager() {
	const [currentTab, setCurrentTab] = useState<DataStructureTabs>("content-types")

	let content: ReactNode
	if (currentTab === "content-types") {
		content = <ContentTypesManager />
	}
	else if (currentTab === "fields") {
		content = <FieldsManager />
	}
	else {
		content = <p>Tab Not Found: {currentTab}</p>
	}

	return (
		<div>
			<JButtonGroup align="left">
				<JButton onClick={() => setCurrentTab("content-types")}>Content Types</JButton>
				<JButton onClick={() => setCurrentTab("fields")}>Fields</JButton>
			</JButtonGroup>

			<div>
				{content}
			</div>
		</div>
	)
}
