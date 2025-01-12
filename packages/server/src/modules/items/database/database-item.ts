import {ItemDto} from "@headbase-app/common";

export interface ItemDtoWithOwner extends ItemDto {
	ownerId: string
}
