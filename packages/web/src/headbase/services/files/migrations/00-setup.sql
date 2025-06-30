create table if not exists files_history (
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
    -- Metadata
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    deleted_at text
);
