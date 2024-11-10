import {Link, useParams} from "wouter";


export default function EditFieldPage() {
	const {fieldId} = useParams<{fieldId: string}>()

	console.debug(fieldId)

	return (
		<div>
			<h1>Edit field page</h1>
			<Link to='/'>Go home</Link>
		</div>
	)
}
