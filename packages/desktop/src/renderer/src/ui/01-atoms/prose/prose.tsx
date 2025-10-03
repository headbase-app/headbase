import {ComponentProps} from "react";
import {clsx} from "clsx";

export interface ProseProps extends ComponentProps<'div'> {
	/** A string of raw HTML. */
	html?: string
}

/**
 * Display WYSIWYG content via React children or a raw HTML string.
 */
export function Prose({
	className,
	html,
	...htmlProps
}: ProseProps) {
	return (
		<div
			className={clsx("prose", className)}
			{...htmlProps}
			/* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml  */
			dangerouslySetInnerHTML={html ? {__html: html } : undefined}
		/>
	)
}
