create table if not exists file_index (
    -- Path Identifier
    path text not null primary key,
    -- File Identifiers
    id text not null,
    parent_id text,
    is_directory integer,
    -- Version Identifiers
    version_id text not null,
    previous_version_id text,
    -- Data
    type text not null,
    name text not null,
    hash text not null,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null
);

create table if not exists file_snapshots (
    -- Version Identifiers
    id text not null primary key,
    previous_version_id text,
    -- File Identifiers
    file_id text not null,
    parent_id text,
    is_directory integer,
    -- Data
    type text not null,
    name text not null,
    hash text not null,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    deleted_at text,
    deleted_by text
);
