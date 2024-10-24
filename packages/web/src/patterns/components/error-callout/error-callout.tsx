import { JCallout } from "@ben-ryder/jigsaw-react";
import React from "react";
import { ErrorTypes, HeadbaseError } from "@headbase-toolkit/control-flow";

export interface ErrorCalloutProps {
	errors: unknown[]
}

export function ErrorCallout(props: ErrorCalloutProps) {
	const processedErrors = props.errors.map(error => {
		if (error instanceof HeadbaseError) {
			return error.cause
		}

		return {
			type: ErrorTypes.SYSTEM_ERROR,
			originalError: error
		}
	})

	return (
		<JCallout variant="critical">
			{processedErrors.map(error => (
				// eslint-disable-next-line react/jsx-key -- what key could I use here?
				<div>
					<strong>{error.type}</strong>
					<p>{error.devMessage}</p>
				</div>
			))}
		</JCallout>
	)
}
