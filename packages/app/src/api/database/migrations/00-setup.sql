create table if not exists objects (
    -- Spec/Type Information
    spec text not null,
    type text not null,
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    previous_version_id text,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    -- Data
    fields json not null,
    blob blob
);

create table if not exists history (
    -- Spec/Type Information
    spec text not null,
    type text not null,
    -- Identifiers
    object_id text not null,
    id text not null primary key,
    previous_version_id text,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
		updated_at text not null default (strftime('%FT%R:%fZ')),
		updated_by text not null,
    deleted_at text default (strftime('%FT%R:%fZ')),
    deleted_by text,
    -- Data
    fields json,
    blob blob
);
