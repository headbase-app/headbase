import { expect, test } from 'vitest'
import {HeadbaseDatabase} from "../db.ts";
import {EventsService} from "@api/events/events.service.ts";
import {DeviceService} from "@api/device/device.service.ts";

test('database should work', async () => {
	const device = new DeviceService()
	const events = new EventsService(device)
	const hb = new HeadbaseDatabase(events, device, {databasePath: "/tests/test.hb"})

	const results = await hb.query()
	expect(Array.isArray(results)).toEqual(true)
	expect(results.length).toEqual(0)

	await hb.create({
		type: "https://example.com/test",
		id: "391de855-f123-4963-a0ff-70ca04bbaf02",
		createdBy: "testing1",
		fields: {
			test: "1",
		},
		blob: null,
	})

	const newResults = await hb.query()
	expect(Array.isArray(newResults)).toEqual(true)
	expect(newResults.length).toEqual(1)
})
