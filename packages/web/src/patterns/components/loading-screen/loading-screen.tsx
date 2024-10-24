import {Loader2 as LoadingIcon} from "lucide-react";
import { JIcon } from "@ben-ryder/jigsaw-react";
import "./loading-screen.scss"

export function LoadingScreen() {
	return (
		<div className="loading-screen">
			<div className="loading-screen__content">
				<JIcon variant="teal"><LoadingIcon /></JIcon>
				<p className="loading-screen__message">Loading and decrypting your content...</p>
			</div>
		</div>
	)
}