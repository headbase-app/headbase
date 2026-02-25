import {IEventsAPI} from "@api/events/events.interface";
import {EventTypes} from "@api/events/events";
import {LiveQueryStatus, LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";
import {IFilesAPI} from "@api/files/files.interface";
import {FileSystemDirectory} from "@/main/file-system/operations";

export class FilesAPI implements IFilesAPI {
	constructor(
		private readonly eventsService: IEventsAPI
	) {}

	async tree(): Promise<FileSystemDirectory | null> {
		const result = await window.platformAPI.filesTree()
		if (result.error) {
			throw result
		}

		return result.result;
	}

	liveTree(subscriber: LiveQuerySubscriber<FileSystemDirectory | null>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const result = await this.tree()
				subscriber({status: LiveQueryStatus.SUCCESS, result: result })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async () => {
			runQuery()
		}

		this.eventsService.subscribe(EventTypes.DATABASE_OPEN, handleEvent)
		this.eventsService.subscribe(EventTypes.DATABASE_CLOSE, handleEvent)
		this.eventsService.subscribe(EventTypes.FILE_SYSTEM_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_OPEN, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_CLOSE, handleEvent)
				this.eventsService.unsubscribe(EventTypes.FILE_SYSTEM_CHANGE, handleEvent)
			}
		}
	}
}
