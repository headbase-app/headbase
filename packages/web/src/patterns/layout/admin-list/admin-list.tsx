import { ReactNode } from "react";
import { JButton, JProse } from "@ben-ryder/jigsaw-react";
import { GenericManagerNavigate } from "../../features/common/generic-manager/generic-manager";

export interface AdminListItemProps {
	id: string
	title: string
	description?: string
	icon?: ReactNode
	navigate: GenericManagerNavigate
}

export interface AdminListProps {
	title: string
	description: string
	addNewText: string
	noItemsText: string
	items: AdminListItemProps[]
	loadingText: string
	isLoading: boolean
	navigate: GenericManagerNavigate
}

export function AdminList(props: AdminListProps) {
	return (
		<div className="admin-list">
			<div className="admin-list__header">
				<h2>{props.title}</h2>
				<JProse>
					<p>{props.description}</p>
				</JProse>
			</div>
			<div>
				<JButton onClick={() => {props.navigate({screen: "new"})}}>{props.addNewText}</JButton>
			</div>
			{props.isLoading &&
        <div className="admin-list__placeholder-message">
        	{props.noItemsText}
        </div>
			}
			{!props.isLoading && props.items.length === 0 &&
        <div className="admin-list__no-items">
        	{props.noItemsText}
        </div>
			}
			{!props.isLoading && props.items.length > 0 &&
        <ul className="admin-list__list">
        	{props.items.map(item =>
        		<AdminListItem key={item.id} {...item} />
        	)}
        </ul>
			}
		</div>
	)
}

export function AdminListItem(props: AdminListItemProps) {
	return (
		<li className="admin-list-item">
			<div className="admin-list-item__content">
				{props.icon && props.icon}
				<h3>{props.title}</h3>
			</div>
			{props.description &&
        <div className="admin-list-item__data">
        	<p className="admin-list-item__description">{props.description}</p>
        </div>
			}
			<div className="admin-list-item__actions">
				<JButton variant="destructive" onClick={() => {props.navigate({screen: "edit", id: props.id})}}>Delete</JButton>
				<JButton onClick={() => {props.navigate({screen: "edit", id: props.id})}}>Edit</JButton>
			</div>
		</li>
	)
}
