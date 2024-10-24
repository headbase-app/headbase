import {ItemDto, VersionDto} from "@headbase-app/common";
import {testAdminUser1Vault1, testUser1Vault1, testUser1Vault2} from "@testing/data/vaults.js";
import {randomUUID} from "node:crypto";
import {testAdminUser1} from "@testing/data/users.js";
import { writeFile } from "node:fs/promises"

export interface TestItemDto extends ItemDto {
	versions: {
		active: VersionDto[],
		deleted: VersionDto[]
	};
}

interface GetTestVersionsOptions {
	itemId: string
	deviceName: string,
	total: number
	isDeleted?: boolean
}

function getTestVersions(options: GetTestVersionsOptions): VersionDto[] {
	const versions: VersionDto[] = [];
	for (let index = 0; index < options.total; index++) {
		versions.push({
			itemId: options.itemId,
			id: randomUUID(),
			deviceName: options.deviceName,
			protectedData: `data${index}`,
			createdAt: new Date().toISOString(),
			deletedAt: options.isDeleted ? new Date().toISOString() : null,
		})
	}
	return versions
}

interface GetTestItemsOptions {
	vaultId: string
	type: string,
	total: number
	isDeleted?: boolean
}

function getTestItems(options: GetTestItemsOptions): TestItemDto[] {
	const items: TestItemDto[] = [];
	for (let index = 0; index < options.total; index++) {
		const itemId = randomUUID();
		items.push({
			vaultId: options.vaultId,
			id: itemId,
			type: options.type,
			createdAt: new Date().toISOString(),
			deletedAt: options.isDeleted ? new Date().toISOString() : null,
			versions: options.isDeleted ? {
				active: [],
				deleted: [],
			} : {
				active: [
					...getTestVersions({itemId, total: 10, deviceName: "device1"}),
					...getTestVersions({itemId, total: 10, deviceName: "device2"}),
				],
				deleted: [
					...getTestVersions({itemId, total: 5, deviceName: "device3", isDeleted: true}),
				]
			},
		})
	}
	return items
}

const testItems = Object.freeze({
	[testUser1Vault1.id]: {
		active: [
			...getTestItems({vaultId: testUser1Vault1.id, type: "note", total: 10}),
			...getTestItems({vaultId: testUser1Vault1.id, type: "tag", total: 5}),
			...getTestItems({vaultId: testUser1Vault2.id, type: "note", total: 10}),
			...getTestItems({vaultId: testUser1Vault2.id, type: "tag", total: 5}),
		],
		deleted: [
			...getTestItems({vaultId: testUser1Vault1.id, type: "note", total: 5, isDeleted: true}),
			...getTestItems({vaultId: testUser1Vault1.id, type: "tag", total: 5, isDeleted: true}),
			...getTestItems({vaultId: testUser1Vault2.id, type: "note", total: 5, isDeleted: true}),
			...getTestItems({vaultId: testUser1Vault2.id, type: "tag", total: 5, isDeleted: true}),
		]
	},
	[testAdminUser1.id]: {
		active: [
			...getTestItems({vaultId: testAdminUser1Vault1.id, type: "note", total: 10}),
			...getTestItems({vaultId: testAdminUser1Vault1.id, type: "tag", total: 5}),
		],
		deleted: [
			...getTestItems({vaultId: testAdminUser1Vault1.id, type: "note", total: 5, isDeleted: true}),
			...getTestItems({vaultId: testAdminUser1Vault1.id, type: "tag", total: 5, isDeleted: true})
		]
	}
})

await writeFile("./test-items.json", JSON.stringify(testItems, null, 2));
