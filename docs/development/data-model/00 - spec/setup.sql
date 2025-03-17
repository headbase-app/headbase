
create table if not exists items (
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    previous_version_id text,
    -- Metadata
    role text not null,
    created_at text not null default (strftime('%FT%R:%fZ')),
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    deleted_at text,
    -- Content
    properties json,
    data json
);

create table if not exists items_versions (
    -- Identifiers
    entity_id text not null,
    id text not null primary key,
    previous_version_id text,
    -- Metadata
    role text not null,
    created_at text not null default (strftime('%FT%R:%fZ')),
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    deleted_at text,
    -- Content
    properties json,
    data json
);

-- Create new version when entity is first created.
create trigger if not exists items_create_version_on_insert
before insert on items
begin
    insert into items_versions(entity_id, id, previous_version_id, role, created_at, updated_at, updated_by, deleted_at, properties, data)
    values (NEW.id, NEW.version_id, NEW.previous_version_id, NEW.role, NEW.created_at, NEW.updated_at, NEW.updated_by, NEW.deleted_at, NEW.properties, NEW.data);
end;

-- Create new version when entity is updated (unless setting deletedAt, or the version already exists).
create trigger if not exists items_create_version_on_update
before update on items
when NEW.deleted_at is not null and (select count() from items_versions where id = new.version_id) = 0
begin
    insert into items_versions(entity_id, id, previous_version_id, role, created_at, updated_at, updated_by, deleted_at, properties, data)
    values (NEW.id, NEW.version_id, NEW.previous_version_id, NEW.role, NEW.created_at, NEW.updated_at, NEW.updated_by, NEW.deleted_at, NEW.properties, NEW.data);
end;

-- Delete all history when the deleted flag is set.
create trigger if not exists items_delete_versions_on_deletion_flag
before update on items
when NEW.deleted_at is not null
begin
    delete from items_versions where entity_id = NEW.id;
end;

-- Block updates once the is_deleted flag is set.
create trigger if not exists items_block_updates_when_deleted
before update on items
when OLD.deleted_at is not null
begin
    select raise (abort, 'entity updates not allowed once deletedAt is set.');
end;

-- Disable history updates
create trigger if not exists items_block_versions_updates
    before update on items_versions
begin
    select raise (abort, 'history updates are not allowed.');
end;
