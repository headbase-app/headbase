
create table if not exists documents (
    -- Specification
    spec text not null,
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    previous_version_id text,
    type text not null,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    -- Data
    data json
);

create table if not exists documents_history (
    -- Specification
    spec text not null,
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    previous_version_id text,
    type text not null,
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    -- Data
    data json
);
