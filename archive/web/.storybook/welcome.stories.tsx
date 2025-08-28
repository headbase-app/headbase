export default {
	title: "Welcome",
};

export function Welcome() {
	return (
		<div className="j-content-section">
			<div className="j-prose">
				<h1>Welcome to the Headbase Storybook!</h1>
				<p>
					This storybook is used to develop components of the web interface in
					isolation from the application itself.
				</p>
				<p>
					The application and it's components also make use of my component
					library called{" "}
					<a href="https://github.com/ben-ryder/jigsaw">Jigsaw</a> which is
					developed and maintained for use across different projects.
				</p>
			</div>
		</div>
	);
}
