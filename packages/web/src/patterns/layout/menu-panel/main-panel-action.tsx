import {ReactNode} from "react";

import "./main-panel-action.scss";
import classNames from "classnames";

export interface MainPanelActionProps {
	text: string
	icon: ReactNode
	onSelect: () => void
	isSpecial?: boolean
}

export function MainPanelAction(props: MainPanelActionProps) {
	return (
		<div
			className={classNames(
				"main-panel-action",
				{
					"main-panel-action--special": props.isSpecial
				})
			}>
			<button className="main-panel-action__button" onClick={props.onSelect}>
				<span className="main-panel-action__icon">{props.icon}</span>
				<span className="main-panel-action__text">{props.text}</span>
			</button>
		</div>
	)
}
