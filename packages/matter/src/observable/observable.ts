import {Observable} from "rxjs";
import {type LiveQueryResult, LiveQueryStatus} from "./live-query.js";
import {EventTypes, type VersionCreateEvent} from "../events/events.js";
import type {MatterDocument} from "../db/types.js";
import type {Query} from "../query/query.js";
import type {IMatterDatabase} from "../db/db.js";

export class _MatterObservable {
    constructor(
        private db: IMatterDatabase
    ) {}

    liveGet(id: string) {
        return new Observable<LiveQueryResult<MatterDocument | null>>((observer) => {
            const runQuery = async () => {
                observer.next({status: LiveQueryStatus.LOADING, result: null});

                try {
                    const doc = await this.db.get(id);
                    observer.next({status: LiveQueryStatus.SUCCESS, result: doc });
                }
                catch (error) {
                    observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null});
                }
            }

            const handleNewVersion = (event: VersionCreateEvent) => {
                if (event.detail.id === id) {
                    runQuery();
                }
            }

            this.db.events.subscribe(EventTypes.DOCUMENT_UPDATE, runQuery);
            this.db.events.subscribe(EventTypes.DOCUMENT_DELETE, runQuery);
            this.db.events.subscribe(EventTypes.VERSION_CREATE, handleNewVersion);

            runQuery()
            return () => {
                this.db.events.unsubscribe(EventTypes.DOCUMENT_UPDATE, runQuery);
                this.db.events.unsubscribe(EventTypes.DOCUMENT_DELETE, runQuery);
                this.db.events.subscribe(EventTypes.VERSION_CREATE, handleNewVersion);
            }
        })
    }

    liveQuery(query?: Query) {
        return new Observable<LiveQueryResult<MatterDocument[]>>((observer) => {
            const runQuery = async () => {
                observer.next({status: LiveQueryStatus.LOADING, result: null});

                try {
                    const result = await this.db.query(query);
                    observer.next({status: LiveQueryStatus.SUCCESS, result });
                }
                catch (error) {
                    observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null});
                }
            }

            this.db.events.subscribe(EventTypes.DOCUMENT_CREATE, runQuery);
            this.db.events.subscribe(EventTypes.DOCUMENT_UPDATE, runQuery);
            this.db.events.subscribe(EventTypes.DOCUMENT_DELETE, runQuery);
            this.db.events.subscribe(EventTypes.VERSION_CREATE, runQuery);
            this.db.events.subscribe(EventTypes.VERSION_DELETE, runQuery);

            runQuery()
            return () => {
                this.db.events.unsubscribe(EventTypes.DOCUMENT_CREATE, runQuery);
                this.db.events.unsubscribe(EventTypes.DOCUMENT_UPDATE, runQuery);
                this.db.events.unsubscribe(EventTypes.DOCUMENT_DELETE, runQuery);
                this.db.events.unsubscribe(EventTypes.VERSION_CREATE, runQuery);
                this.db.events.unsubscribe(EventTypes.VERSION_DELETE, runQuery);
            }
        })
    }

    liveQueryVersions(query?: Query) {
        return new Observable<LiveQueryResult<MatterDocument[]>>((observer) => {
            const runQuery = async () => {
                observer.next({status: LiveQueryStatus.LOADING, result: null});

                try {
                    const result = await this.db.queryVersions(query);
                    observer.next({status: LiveQueryStatus.SUCCESS, result });
                }
                catch (error) {
                    observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null});
                }
            }

            this.db.events.subscribe(EventTypes.DOCUMENT_CREATE, runQuery);
            this.db.events.subscribe(EventTypes.DOCUMENT_UPDATE, runQuery);
            this.db.events.subscribe(EventTypes.DOCUMENT_DELETE, runQuery);
            this.db.events.subscribe(EventTypes.VERSION_CREATE, runQuery);
            this.db.events.subscribe(EventTypes.VERSION_DELETE, runQuery);

            runQuery()
            return () => {
                this.db.events.unsubscribe(EventTypes.DOCUMENT_CREATE, runQuery);
                this.db.events.unsubscribe(EventTypes.DOCUMENT_UPDATE, runQuery);
                this.db.events.unsubscribe(EventTypes.DOCUMENT_DELETE, runQuery);
                this.db.events.unsubscribe(EventTypes.VERSION_CREATE, runQuery);
                this.db.events.unsubscribe(EventTypes.VERSION_DELETE, runQuery);
            }
        })
    }
}
