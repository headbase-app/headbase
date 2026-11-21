export const EventTypes = {
    // Document Events
    DOCUMENT_CREATE: "document-create",
    DOCUMENT_UPDATE: "document-update",
    DOCUMENT_DELETE: "document-delete",
    DOCUMENT_PURGE: "document-purge",
    // Version Events
    VERSION_CREATE: "version-create",
    VERSION_DELETE: "version-delete",
    VERSION_PURGE: "version-purge",
} as const

export interface DocumentCreateEvent {
    type: typeof EventTypes.DOCUMENT_CREATE,
    detail: {
        id: string, vid: string
    }
}

export interface DocumentUpdateEvent {
    type: typeof EventTypes.DOCUMENT_UPDATE,
    detail: {
        id: string, vid: string
    }
}
export interface DocumentDeleteEvent {
    type: typeof EventTypes.DOCUMENT_DELETE,
    detail: {
        id: string, vid: string
    }
}

export interface DocumentPurgeEvent {
    type: typeof EventTypes.DOCUMENT_PURGE,
    detail: {
        id: string
    }
}

export interface VersionCreateEvent {
    type: typeof EventTypes.VERSION_CREATE,
    detail: {
        id: string, vid: string
    }
}

export interface VersionDeleteEvent {
    type: typeof EventTypes.VERSION_DELETE,
    detail: {
        id: string, vid: string
    }
}

export interface VersionPurgeEvent {
    type: typeof EventTypes.VERSION_PURGE,
    detail: {
        id: string, vid: string
    }
}

export type MatterEvent =
    DocumentCreateEvent | DocumentUpdateEvent | DocumentDeleteEvent | DocumentPurgeEvent |
    VersionCreateEvent | VersionDeleteEvent

export interface EventMap {
    // Document Events
    [EventTypes.DOCUMENT_CREATE]: DocumentCreateEvent,
    [EventTypes.DOCUMENT_UPDATE]: DocumentUpdateEvent,
    [EventTypes.DOCUMENT_DELETE]: DocumentDeleteEvent,
    [EventTypes.DOCUMENT_PURGE]: DocumentPurgeEvent,
    // Version Events
    [EventTypes.VERSION_CREATE]: VersionCreateEvent,
    [EventTypes.VERSION_DELETE]: VersionDeleteEvent,
    [EventTypes.VERSION_PURGE]: VersionPurgeEvent,
}
export type EventTypes = keyof EventMap
