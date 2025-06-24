import "./content-card.css";

export interface ContentCardProps {
	id: string;
	name: string;
	description?: string | null;
	onSelect: () => void
}

export function ContentCard(props: ContentCardProps) {
	return (
		<div className="content-card" onClick={props.onSelect} tabIndex={0}>
			<div className="content-card__content">
				<h3 className="content-card__name">{props.name}</h3>
				{props.description && (
					<p className="content-card__description">{props.description}</p>
				)}
			</div>
		</div>
	);
}
