import type {_MatterDatabase} from "../db/db.js";

export interface SyncSnapshot {
    config: {
        tombstoneExpiryDays: number;
    }
    versions: {
        [id: string]: string;
    }
    deleted: string[]
}

export type SyncAction = {
    action: "create",
    vid: string
} | {
    action: "delete",
    vid: string
}

export interface _MatterSyncConfig {
    relayUrl: string;
    relaySecret?: string;
}

export class _MatterSync {
    constructor(
        private db: _MatterDatabase,
        private config: _MatterSyncConfig,
    ) {}

    async _getLocalSnapshot(): Promise<SyncSnapshot> {
        // todo: only load required fields (id, vid, updatedAt, deleted)
        const results = await this.db.queryVersions();

        const snapshot: SyncSnapshot = {
            config: {
                tombstoneExpiryDays: 90,
            },
            versions: {},
            deleted: []
        };
        for (const result of results) {
            if (result.deleted) {
                snapshot.deleted.push(result.vid)
            }
            else {
                snapshot.versions[result.vid] = result.updatedAt;
            }
        }

        return snapshot;
    }

    /**
     * Compare a source snapshot with one of more target snapshots and return the actions required to bring
     * the SOURCE snapshot up to date.
     *
     * @param sourceSnapshot
     * @param targetSnapshots
     */
    _compareSnapshots(sourceSnapshot: SyncSnapshot, ...targetSnapshots: SyncSnapshot[]): SyncAction[] {
        const syncActions: SyncAction[] = [];

        for (const targetSnapshot of targetSnapshots) {
            if (sourceSnapshot.config.tombstoneExpiryDays != targetSnapshot.config.tombstoneExpiryDays) {
                throw new Error("tombstoneExpiryDays must match between snapshots")
            }
        }

        for (const targetSnapshot of targetSnapshots) {
            for (const vid of targetSnapshot.deleted) {
                if (sourceSnapshot.versions[vid]) {
                    syncActions.push({
                        action: "delete",
                        vid,
                    })
                }
            }
            for (const vid of Object.keys(targetSnapshot.versions)) {
                if (!sourceSnapshot.versions[vid]) {
                    syncActions.push({
                        action: "create",
                        vid,
                    })
                }
            }
        }

        return syncActions;
    }
}
