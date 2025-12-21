import {createEffect, createSignal, from} from "solid-js";
import {useCurrentVaultService} from "@/framework/current-vault.context.ts";
import {HeadbaseDatabase} from "@api/database/db.ts";
import {DeviceService} from "@api/device/device.service.ts";
import {EventsService} from "@api/events/events.service.ts";

export function useDatabase() {
	const currentVaultService = useCurrentVaultService()
	const currentVaultQuery = from(currentVaultService.liveGet())
	const [database, setDatabase] = createSignal<HeadbaseDatabase>()

	createEffect(() => {
		const query = currentVaultQuery()
		if (query?.status === "success" && query.result) {
			const deviceService = new DeviceService();
			const eventsService = new EventsService(deviceService);
			const hb = new HeadbaseDatabase(eventsService, deviceService, {databasePath: `/headbase-v1/${query.result.id}.hb`})
			setDatabase(hb)
		}
	})

	return database
}
