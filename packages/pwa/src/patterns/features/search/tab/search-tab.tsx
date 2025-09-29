import {WithTabData} from "../../workspace/workspace";

import "./search.css"
import {Search} from "../search.tsx";

export interface SearchTabProps extends WithTabData {}

export function SearchTab() {
	return (
		<div className='search-tab'>
			<Search />
		</div>
	)
}
