import { useState } from "react";
import { GenericManagerScreens } from "../../../common/generic-manager/generic-manager";
import { CreateTagScreen } from "./screens/create-tag-screen";
import { EditTagScreen } from "./screens/edit-tag-screen";
import { ListTagsScreen } from "./screens/list-tags-screen/list-tags-screen";

export function TagsManager() {
	const [currentScreen, navigate] = useState<GenericManagerScreens>({screen: "list"})

	if (currentScreen.screen === 'new') {
		return (
			<CreateTagScreen
				navigate={navigate}
			/>
		)
	}
	else if (currentScreen.screen === 'edit') {
		return (
			<EditTagScreen
				id={currentScreen.id}
				navigate={navigate}
			/>
		)
	}
	else {
		return (
			<ListTagsScreen
				navigate={navigate}
			/>
		)
	}
}