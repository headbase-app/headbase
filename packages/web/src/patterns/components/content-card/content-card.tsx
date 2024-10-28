import "./content-card.scss";
import {JPill} from "@ben-ryder/jigsaw-react";
import {TagDto} from "@headbase-toolkit/schemas/entities/tags";

export interface ContentCardProps {
	id: string;
	name: string;
	description?: string;
	tags?: TagDto[]
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
				{props.tags && props.tags.length > 0 &&
          <div className="content-card__tags">
          	{props.tags.map(tag =>
          		<JPill
          			key={tag.id}
          			variant={tag.data.colourVariant || undefined}
          		>{tag.data.name}</JPill>
          	)}
          </div>
				}
			</div>
		</div>
	);
}
