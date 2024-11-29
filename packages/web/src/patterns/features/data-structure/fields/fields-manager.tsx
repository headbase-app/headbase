import { useState } from "react";
import { GenericManagerScreens } from "../../../common/generic-manager/generic-manager";
import { ListFieldsScreen } from "./screens/list-fields-screen";
import {CreateFieldScreen} from "./screens/create-field-screen";
import { EditFieldScreen } from "./screens/edit-field-screen";

export function FieldsManager() {
	const [currentScreen, navigate] = useState<GenericManagerScreens>({screen: "list"})

	if (currentScreen.screen === "new") {
		return <CreateFieldScreen navigate={navigate} />
	}
	else if (currentScreen.screen === "edit") {
		return <EditFieldScreen navigate={navigate} id={currentScreen.id} />
	}
	else {
		return <ListFieldsScreen navigate={navigate} />
	}
}
