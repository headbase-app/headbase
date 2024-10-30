/**
  - Tables are structured as 'entities' and 'entities_versions' to support versioned content.
  - The 'hbv' field on all items is the 'headbase version'. This is included for now in case
  it helps in the future for migrations or when importing/exporting content.
  - There are relationships between tables, but these are not strictly enforced on purpose due to the
  challenging nature of local-first data synchronisation and the use of json fields to store most relationship data, which is also
  done to better handle data synchronisation and retain the possibility of mirroring database content to a filesystem
  as distinct files.
 */


-- Tags
create table if not exists tags (
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    current_version_id text
);

create table if not exists tags_versions (
    entity_id text not null,
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    previous_version_id text,
    created_by text not null,
    hbv text not null,
    name text not null,
    colour text
);

create table if not exists fields (
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    current_version_id text,
    -- A fields type should never change, so this is added to the entity table not the version.
    type text not null
);

create table if not exists fields_versions (
    entity_id text not null,
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    previous_version_id text,
    created_by text not null,
    hbv text not null,
    label text not null,
    description text,
    settings json
);

create table if not exists content_types (
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    current_version_id text
);

create table if not exists content_types_versions (
    entity_id text not null,
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    previous_version_id text,
    created_by text not null,
    hbv text not null,
    name text not null,
    description text,
    icon text,
    colour text,
    template_name text,
    template_tags json,
    fields json
);

create table if not exists content (
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    current_version_id text,
    -- A content items type should never change, so this is added to the entity table not the version.
    type text not null
);

create table if not exists content_versions (
    entity_id text not null,
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    previous_version_id text,
    created_by text not null,
    hbv text not null,
    name text not null,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    tags json,
    fields json
);

create table if not exists views (
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    hbv text not null,
    current_version_id text
);

create table if not exists views_versions (
    entity_id text not null,
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    previous_version_id text,
    created_by text not null,
    hbv text not null,
    name text not null,
    description text,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    tags json,
    query json
);
