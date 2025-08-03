import "./shelves.css"

export function Shelves() {
	const shelves = [
		{
			name: "Vault Menu",
			position: 'top',
			content: (
				<>
					<button>Vault Name</button>
					<button>Status</button>
				</>
			)
		},
		{
			name: "Status",
			position: 'bottom',
			content: (
				<>
					<p>Status goes here...</p>
				</>
			)
		},
		{
			name: "Workspace Controls",
			position: 'bottom',
			content: (
				<>
					<button>lock</button>
					<button onClick={() => {
						window.dispatchEvent(new CustomEvent('workspace-reset'));
					}}>reset</button>
				</>
			)
		}
	]

	const topShelves = shelves.filter((shelve) => shelve.position === 'top')
	const bottomShelves = shelves.filter((shelve) => shelve.position === 'bottom')

	return (
		<>
			{topShelves.length &&
          <div className="shelf" style={{top: 0, left: 0}}>
						{topShelves.map((shelve) => (
							<div
								className="shelf-item"
								key={shelve.name}
							>
								<div>
									{shelve.content}
								</div>
							</div>
						))}
          </div>
			}
			{bottomShelves.length &&
          <div className="shelf" style={{bottom: 0, right: 0}}>
						{bottomShelves.map((shelve) => (
							<div
								className="shelf-item"
								key={shelve.name}
							>
								<div>
									{shelve.content}
								</div>
							</div>
						))}
          </div>
			}
		</>
	)
}