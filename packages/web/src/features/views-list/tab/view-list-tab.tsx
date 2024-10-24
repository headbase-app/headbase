import {WithTabData} from "../../workspace/workspace";

import "./view-list-tab.scss"
import {ViewList} from "../view-list";

export interface ViewListTabProps extends WithTabData {}

export function ViewListTab() {
	return (
		<div className='view-list-tab'>
			<ViewList />
		</div>
	)
}
