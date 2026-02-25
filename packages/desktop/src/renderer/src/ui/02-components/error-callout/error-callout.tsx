export interface ErrorCalloutProps {
	errors: any[]
}

export function ErrorCallout({errors}: ErrorCalloutProps) {
	return (
		<ul>
			{errors.map((error, index) => (
				<li key={index}>{error}</li>
			))}
		</ul>
	)
}
