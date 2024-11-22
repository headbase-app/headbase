import {Link} from "wouter";

export function HomePage() {
	return (
		<ul>
			<li><Link to='/fields' className='text-text-emphasis underline hover:text-teal-300'>Fields</Link></li>
		</ul>
	)
}