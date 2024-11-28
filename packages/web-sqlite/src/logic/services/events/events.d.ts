import { UserDto } from "@headbase-app/common";
import { DeviceContext } from "../../database/adapter.ts";
export declare const EventTypes: {
    readonly DATA_CHANGE: "data-change";
    readonly DATABASE_OPEN: "database-open";
    readonly DATABASE_CLOSE: "database-close";
    readonly DATABASE_UNLOCK: "database-unlock";
    readonly DATABASE_LOCK: "database-lock";
    readonly DATABASE_CHANGE: "database-change";
    readonly AUTH_LOGIN: "auth-login";
    readonly AUTH_LOGOUT: "auth-logout";
    readonly SYNC_STATUS: "sync-status";
    readonly SYNC_MESSAGE: "sync-message";
    readonly STORAGE_PERMISSION: "storage-permission";
    readonly USER_LOGIN: "user-login";
    readonly USER_LOGOUT: "user-logout";
};
export interface DataChangeEvent {
    type: typeof EventTypes.DATA_CHANGE;
    detail: {
        context: DeviceContext;
        data: {
            databaseId: string;
            tableKey: string;
            action: 'create' | 'update' | 'delete' | 'purge' | 'delete-version';
            id: string;
        };
    };
}
export interface DatabaseOpenEvent {
    type: typeof EventTypes.DATABASE_OPEN;
    detail: {
        context: DeviceContext;
        data: {
            id: string;
        };
    };
}
export interface DatabaseCloseEvent {
    type: typeof EventTypes.DATABASE_CLOSE;
    detail: {
        context: DeviceContext;
        data: {
            id: string;
        };
    };
}
export interface DatabaseUnlockEvent {
    type: typeof EventTypes.DATABASE_UNLOCK;
    detail: {
        context: DeviceContext;
        data: {
            id: string;
        };
    };
}
export interface DatabaseLockEvent {
    type: typeof EventTypes.DATABASE_LOCK;
    detail: {
        context: DeviceContext;
        data: {
            id: string;
        };
    };
}
export interface DatabaseChangeEvent {
    type: typeof EventTypes.DATABASE_CHANGE;
    detail: {
        context: DeviceContext;
        data: {
            id: string;
            action: 'create' | 'update' | 'delete' | 'purge' | 'change-password';
        };
    };
}
export interface StoragePermissionEvent {
    type: typeof EventTypes.STORAGE_PERMISSION;
    detail: {
        context: DeviceContext;
        data: {
            isGranted: boolean;
        };
    };
}
export interface UserLoginEvent {
    type: typeof EventTypes.USER_LOGIN;
    detail: {
        context: DeviceContext;
        data: {
            serverUrl: string;
            user: UserDto;
        };
    };
}
export interface UserLogoutEvent {
    type: typeof EventTypes.USER_LOGOUT;
    detail: {
        context: DeviceContext;
    };
}
export type HeadbaseEvent = DataChangeEvent | DatabaseOpenEvent | DatabaseCloseEvent | DatabaseChangeEvent | DatabaseUnlockEvent | DatabaseLockEvent;
export interface EventMap {
    [EventTypes.DATA_CHANGE]: DataChangeEvent;
    [EventTypes.DATABASE_OPEN]: DatabaseOpenEvent;
    [EventTypes.DATABASE_CLOSE]: DatabaseCloseEvent;
    [EventTypes.DATABASE_UNLOCK]: DatabaseUnlockEvent;
    [EventTypes.DATABASE_LOCK]: DatabaseLockEvent;
    [EventTypes.DATABASE_CHANGE]: DatabaseChangeEvent;
    [EventTypes.STORAGE_PERMISSION]: StoragePermissionEvent;
    [EventTypes.USER_LOGIN]: UserLoginEvent;
    [EventTypes.USER_LOGOUT]: UserLogoutEvent;
}
export type EventTypes = keyof EventMap;
export type AnyHeadbaseEvent = CustomEvent<UserLoginEvent['detail']> | CustomEvent<UserLogoutEvent['detail']> | CustomEvent<DataChangeEvent['detail']>;
