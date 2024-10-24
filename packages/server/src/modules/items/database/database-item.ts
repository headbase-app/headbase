import {ItemDto, VersionDto} from "@headbase-app/common";

export interface ItemDtoWithOwner extends ItemDto {
	ownerId: string
}

export interface VersionDtoWithOwner extends VersionDto {
	ownerId: string
}
