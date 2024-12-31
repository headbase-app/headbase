import {
	DatabaseAdapter
} from "../../src/logic/services/database/adapter";
import {PlatformAdapter} from "../../src/logic/services/database/adapter";
import {EventsAdapter} from "../../src/logic/services/database/adapter";
import {PlatformAdapterConfig} from "../../src/logic/services/database/adapter";
import {MockDatabaseAdapter} from "./mock-database-adapter";
import {MockEventAdapter} from "./mock-event-adapter";


export class MockPlatformAdapter implements PlatformAdapter {
	database: DatabaseAdapter
	events: EventsAdapter

	constructor(config: PlatformAdapterConfig) {
		this.events = new MockEventAdapter(config)
		this.database = new MockDatabaseAdapter(config)
	}

	async destroy() {
		await this.database.destroy()
		await this.events.destroy()
	}
}
