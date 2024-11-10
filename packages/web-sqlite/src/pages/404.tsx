import {Link} from "wouter";


export default function NotFoundPage() {
	return (
		<div>
			<h1>Page not found</h1>
			<Link to='/'>Go home</Link>
		</div>
	)
}
