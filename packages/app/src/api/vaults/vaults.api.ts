import {CreateVaultDto, UpdateVaultDto, LocalVaultDto} from "@contracts/vaults";
import type {IEventsAPI} from "@api/events/events.interface";
import type {IVaultsAPI} from "@api/vaults/vaults.interface";
import type {IDeviceAPI} from "@api/device/device.interface";
import {type DatabaseChangeEvent, EventTypes} from "@api/events/events";
import {LiveQueryStatus, type LiveQuerySubscriber, type LiveQuerySubscription} from "@contracts/query";
import {z, ZodError} from "zod";
import * as opfsx from "opfsx";
import {ErrorIdentifiers} from "@headbase-app/contracts";

export const VaultsList = z.array(LocalVaultDto)
export type VaultsList = z.infer<typeof VaultsList>

const VAULTS_FILE_PATH = "/headbase-v1/app/vaults.json"

export class VaultsAPI implements IVaultsAPI {
	constructor(
		private readonly deviceService: IDeviceAPI,
		private readonly eventsService: IEventsAPI
	) {}

	async create(createVaultDto: CreateVaultDto) {
		const vaults = await this.query();

		const id = window.crypto.randomUUID()
		const newVault = {
			id,
			...createVaultDto,
		}
		vaults.push(newVault)

		await opfsx.write(VAULTS_FILE_PATH, JSON.stringify(vaults));

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: id,
				action: "create"
			}
		})
		return newVault;
	}

	async update(vaultId: string, updateVaultDto: UpdateVaultDto) {
		const vaults = await this.query();

		let updatedVault: LocalVaultDto|null = null;
		const updatedVaults = vaults.map((v) => {
			if (v.id == vaultId) {
				updatedVault = {...v, ...updateVaultDto}
				return updatedVault;
			}
			return v;
		})

		if (!updatedVault) {
			throw new Error(ErrorIdentifiers.VAULT_NOT_FOUND)
		}

		await opfsx.write(VAULTS_FILE_PATH, JSON.stringify(updatedVaults));

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: vaultId,
				action: "update"
			}
		})

		return updatedVault;
	}

	async delete(vaultId: string) {
		const vaults = await this.query();

		const updatedVaults = vaults.filter(v => v.id !== vaultId);
		if (updatedVaults.length === vaults.length) {
			throw new Error(ErrorIdentifiers.VAULT_NOT_FOUND)
		}

		await opfsx.write(VAULTS_FILE_PATH, JSON.stringify(updatedVaults));

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: vaultId,
				action: "delete"
			}
		})
	}

	async get(vaultId: string): Promise<LocalVaultDto | null> {
		const vaults = await this.query();

		for (const vault of vaults) {
			if (vault.id == vaultId) {
				return vault;
			}
		}

		return null;
	}

	async query(): Promise<LocalVaultDto[]> {
		try {
			const vaultsFile = await opfsx.read(VAULTS_FILE_PATH);
			const content = await vaultsFile.text();
			return VaultsList.parse(JSON.parse(content));
		}
		catch (error) {
			if (error instanceof DOMException && error.message === "Entry not found") {
				return []
			}
			else if (error instanceof ZodError) {
				throw new Error("Vault file is corrupted.", {cause: error})
			}
			throw new Error("Unexpected error.", {cause: error});
		}
	}

	liveQuery(subscriber: LiveQuerySubscriber<LocalVaultDto[]>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const currentVault = await this.query()
				subscriber({status: LiveQueryStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async () => {
			runQuery()
		}

		this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			}
		}
	}

	liveGet(vaultId: string, subscriber: LiveQuerySubscriber<LocalVaultDto | null>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const currentVault = await this.get(vaultId)
				subscriber({status: LiveQueryStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async (e: DatabaseChangeEvent) => {
			if (e.detail.data.id === vaultId) {
				runQuery()
			}
		}

		this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			}
		}
	}
}
