import type {IMatterDriver} from "./driver/driver.js";
import {_MatterDatabase, type _MatterDatabaseConfig} from "./db/db.js";
import {_MatterObservable} from "./observable/observable.js";
import {_MatterSync, type _MatterSyncConfig} from "./sync/sync.js";

export interface MatterConfig {
    driver: IMatterDriver;
    db: _MatterDatabaseConfig,
    sync: _MatterSyncConfig,
}

// todo: events should be separate/injected like driver?
export class Matter extends _MatterDatabase {
    rxjs: _MatterObservable;
    sync: _MatterSync;

    constructor(config: MatterConfig) {
        super(config.driver, config.db);
        this.rxjs = new _MatterObservable(this)
        this.sync = new _MatterSync(this, config.sync)
    }
}
