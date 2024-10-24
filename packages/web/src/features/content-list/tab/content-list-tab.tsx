import {WithTabData} from "../../workspace/workspace";

import "./content-list-tab.scss"
import {ContentList} from "../content-list";

export interface SearchTabProps extends WithTabData {}

export function ContentListTab() {
	return (
		<div className='content-list-tab'>
			<ContentList />
		</div>
	)
}
