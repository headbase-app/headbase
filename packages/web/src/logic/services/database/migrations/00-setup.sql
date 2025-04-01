
create table if not exists objects (
    -- Specification
    spec text not null,
    -- Identifiers
    type text not null,
    id text not null primary key,
    version_id text not null,
    previous_version_id text,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    -- Data
    data json
);

create table if not exists object_versions (
    -- Specification
    spec text not null,
    -- Identifiers
    type text not null,
    object_id text not null,
    id text not null primary key,
    previous_version_id text,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    -- Tombstone
    deleted_at text default (strftime('%FT%R:%fZ')),
    -- Data
    data json
);
