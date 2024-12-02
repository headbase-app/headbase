import { useState } from "react";
import {CreateContentTypeScreen} from "./screens/create-content-type-screen";
import {EditContentTypeScreen} from "./screens/edit-content-type-screen";
import {ListContentTypesScreen} from "./screens/list-content-types-screen";
import {GenericManagerScreens} from "../../common/generic-manager/generic-manager.tsx";


export function ContentTypesManager() {
	const [currentScreen, navigate] = useState<GenericManagerScreens>({screen: "list"})

	if (currentScreen.screen === "new") {
		return <CreateContentTypeScreen navigate={navigate} />
	}
	else if (currentScreen.screen === "edit") {
		return <EditContentTypeScreen navigate={navigate} id={currentScreen.id} />
	}
	else {
		return <ListContentTypesScreen navigate={navigate} />
	}
}
