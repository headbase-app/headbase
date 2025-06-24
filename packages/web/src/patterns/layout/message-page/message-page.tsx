import React, { ReactNode } from "react";

import "./message-page.css"

export interface MessagePageProps {
	heading: string;
	content: ReactNode;
	extraContent?: ReactNode;
}

export function MessagePage(props: MessagePageProps) {
	return (
		<div className="ath-message-page">
			<div className="ath-message-page__panel">
				<h1 className="ath-message-page__panel-heading">{props.heading}</h1>
				<div className="ath-message-page__panel-text">
					<div className="j-prose">{props.content}</div>
				</div>
				<div className="ath-message-page__panel-extra-content">
					{props.extraContent && props.extraContent}
				</div>
			</div>
		</div>
	);
}
