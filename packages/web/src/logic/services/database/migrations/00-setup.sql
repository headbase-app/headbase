/**
  - Tables are structured as 'entities' and 'entities_versions' to support versioned content.
  - The 'hbv' field on all items is the 'headbase version'. This is included for now in case
  it helps in the future for migrations or when importing/exporting content.
  - There are relationships between tables, but these are not strictly enforced on purpose due to the
  challenging nature of local-first data synchronisation and the use of json fields to store most relationship data, which is also
  done to better handle data synchronisation and retain the possibility of mirroring database content to a filesystem
  as distinct files.
 */

create table if not exists fields (
    -- Common
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    -- Common Entity
    current_version_id text
);

create table if not exists fields_versions (
    -- Common
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    -- Common Version
    entity_id text not null,
    previous_version_id text,
    created_by text not null,
    -- Custom
    type text not null,
    name text not null,
    icon text,
    description text,
    settings json
);

create table if not exists content_types (
    -- Common
     id text not null primary key,
     created_at text not null default (strftime('%FT%R:%fZ')),
     is_deleted integer not null default 0 check (is_deleted in (0, 1)),
     hbv text not null,
    -- Common Entity
    current_version_id text
);

create table if not exists content_types_versions (
    -- Common
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    -- Common Version
    entity_id text not null,
    previous_version_id text,
    created_by text not null,
    -- Custom
    name text not null,
    icon text,
    colour text,
    description text,
    template_name text,
    template_fields json
);

create table if not exists content_items (
    -- Common
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    -- Common Entity
    current_version_id text
);

create table if not exists content_items_versions (
    -- Common
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    -- Common Version
    entity_id text not null,
    previous_version_id text,
    created_by text not null,
    -- Custom
    type text not null,
    name text not null,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    fields json
);

create table if not exists views (
    -- Common
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    -- Common Entity
    current_version_id text
);

create table if not exists views_versions (
    -- Common
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    -- Common Version
    entity_id text not null,
    previous_version_id text,
    created_by text not null,
    -- Custom
    type text not null,
    name text not null,
    icon text,
    colour text,
    description text,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    settings json
);
