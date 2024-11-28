"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTypes = void 0;
exports.EventTypes = {
    // Data Events
    DATA_CHANGE: 'data-change',
    // Database Events
    DATABASE_OPEN: 'database-open',
    DATABASE_CLOSE: 'database-close',
    DATABASE_UNLOCK: 'database-unlock',
    DATABASE_LOCK: 'database-lock',
    DATABASE_CHANGE: 'database-change',
    // Auth Events
    AUTH_LOGIN: 'auth-login',
    AUTH_LOGOUT: 'auth-logout',
    // Sync Events
    SYNC_STATUS: 'sync-status',
    SYNC_MESSAGE: 'sync-message',
    // Other Events
    STORAGE_PERMISSION: 'storage-permission',
    // User Events
    USER_LOGIN: 'user-login',
    USER_LOGOUT: 'user-logout',
};
