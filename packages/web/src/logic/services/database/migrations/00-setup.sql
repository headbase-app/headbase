/* ===== Fields ===== */

create table if not exists fields (
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    type text not null,
    name text not null,
    icon text,
    description text,
    settings json
);

create table if not exists fields_history (
    -- Identifiers
    entity_id text not null,
    id text not null primary key,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    type text not null,
    name text not null,
    icon text,
    description text,
    settings json
);

-- Create new version when entity is first created.
create trigger if not exists fields_create_version_on_insert
before insert on fields
begin
    insert into fields_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, type, name, icon, description, settings)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.type, NEW.name, NEW.icon, NEW.description, NEW.settings);
end;

-- Create new version when entity is updated (unless setting the deleted flag, or the version already exists).
create trigger if not exists fields_create_version_on_update
before update on fields
when NEW.is_deleted = 0 and (select count() from fields_history where id = new.version_id) = 0
begin
    insert into fields_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, type, name, icon, description, settings)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.type, NEW.name, NEW.icon, NEW.description, NEW.settings);
end;

-- Delete all history when the deleted flag is set.
create trigger if not exists fields_delete_versions_on_deletion_flag
before update on fields
when NEW.is_deleted = 1
begin
    delete from fields_history where entity_id = NEW.id;
end;

-- Block updates once the is_deleted flag is set.
create trigger if not exists fields_block_updates_when_deleted
before update on fields
when OLD.is_deleted = 1
begin
    select raise (abort, 'entity updates not allowed once is_deleted flag is set.');
end;

-- Disable history updates
create trigger if not exists fields_block_history_updates
    before update on fields_history
begin
    select raise (abort, 'history updates are not allowed.');
end;


/* ===== Content Types ===== */

create table if not exists content_types (
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    name text not null,
    icon text,
    colour text,
    description text,
    template_name text,
    fields json
);

create table if not exists content_types_history (
    -- Identifiers
    entity_id text not null,
    id text not null primary key,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    name text not null,
    icon text,
    colour text,
    description text,
    template_name text,
    fields json
);

-- Create new version when entity is first created.
create trigger if not exists content_types_create_version_on_insert
before insert on content_types
begin
    insert into content_types_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, name, icon, colour, description, template_name, fields)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.name, NEW.icon, NEW.colour, NEW.description, NEW.template_name, NEW.fields);
end;

-- Create new version when entity is updated (unless setting the deleted flag, or the version already exists).
create trigger if not exists content_types_create_version_on_update
before update on content_types
when NEW.is_deleted = 0 and (select count() from content_types_history where id = new.version_id) = 0
begin
    insert into content_types_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, name, icon, colour, description, template_name, fields)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.name, NEW.icon, NEW.colour, NEW.description, NEW.template_name, NEW.fields);
end;

-- Delete all history when the deleted flag is set.
create trigger if not exists content_types_delete_versions_on_deletion_flag
before update on content_types
when NEW.is_deleted = 1
begin
    delete from content_types_history where entity_id = NEW.id;
end;

-- Block updates once the is_deleted flag is set.
create trigger if not exists content_types_block_updates_when_deleted
    before update on content_types
    when OLD.is_deleted = 1
begin
    select raise (abort, 'entity updates not allowed once is_deleted flag is set.');
end;

-- Disable history updates
create trigger if not exists content_types_block_history_updates
    before update on content_types_history
begin
    select raise (abort, 'history updates are not allowed.');
end;


/* ===== Content Items ===== */

create table if not exists content_items (
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    type text not null,
    name text not null,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    fields json
);

create table if not exists content_items_history (
    -- Identifiers
    entity_id text not null,
    id text not null primary key,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    type text not null,
    name text not null,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    fields json
);

-- Create new version when entity is first created.
create trigger if not exists content_items_create_version_on_insert
    before insert on content_items
begin
    insert into content_items_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, type, name, is_favourite, fields)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.type, NEW.name, NEW.is_favourite, NEW.fields);
end;

-- Create new version when entity is updated (unless setting the deleted flag, or the version already exists).
create trigger if not exists content_items_create_version_on_update
    before update on content_items
    when NEW.is_deleted = 0 and (select count() from content_items_history where id = new.version_id) = 0
begin
    insert into content_items_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, type, name, is_favourite, fields)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.type, NEW.name, NEW.is_favourite, NEW.fields);
end;

-- Delete all history when the deleted flag is set.
create trigger if not exists content_items_delete_versions_on_deletion_flag
    before update on content_items
    when NEW.is_deleted = 1
begin
    delete from content_items_history where entity_id = NEW.id;
end;

-- Block updates once the is_deleted flag is set.
create trigger if not exists content_items_block_updates_when_deleted
    before update on content_items
    when OLD.is_deleted = 1
begin
    select raise (abort, 'entity updates not allowed once is_deleted flag is set.');
end;

-- Disable history updates
create trigger if not exists content_items_block_history_updates
    before update on content_items_history
begin
    select raise (abort, 'history updates are not allowed.');
end;


/* ===== Views ===== */

create table if not exists views (
    -- Identifiers
    id text not null primary key,
    version_id text not null,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    type text not null,
    name text not null,
    icon text,
    colour text,
    description text,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    settings json
);

create table if not exists views_history (
    -- Identifiers
    entity_id text not null,
    id text not null primary key,
    -- Timestamps & Deletion
    created_at text not null default (strftime('%FT%R:%fZ')),
    created_by text not null,
    updated_at text not null default (strftime('%FT%R:%fZ')),
    updated_by text not null,
    is_deleted integer not null default 0 check (is_deleted in (0, 1)),
    -- Content
    type text not null,
    name text not null,
    icon text,
    colour text,
    description text,
    is_favourite integer not null default 0 check (is_favourite in (0, 1)),
    settings json
);

-- Create new version when entity is first created.
create trigger if not exists views_create_version_on_insert
    before insert on views
begin
    insert into views_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, type, name, icon, colour, description, is_favourite, settings)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.type, NEW.name, NEW.icon, NEW.colour, NEW.description, NEW.is_favourite, NEW.settings);
end;

-- Create new version when entity is updated (unless setting the deleted flag, or the version already exists).
create trigger if not exists views_create_version_on_update
    before update on views
    when NEW.is_deleted = 0 and (select count() from views_history where id = new.version_id) = 0
begin
    insert into views_history(entity_id, id, created_at, created_by, updated_at, updated_by, is_deleted, type, name, icon, colour, description, is_favourite, settings)
    values (NEW.id, NEW.version_id, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.is_deleted, NEW.type, NEW.name, NEW.icon, NEW.colour, NEW.description, NEW.is_favourite, NEW.settings);
end;

-- Delete all history when the deleted flag is set.
create trigger if not exists views_delete_versions_on_deletion_flag
    before update on views
    when NEW.is_deleted = 1
begin
    delete from views_history where entity_id = NEW.id;
end;

-- Block updates once the is_deleted flag is set.
create trigger if not exists views_block_updates_when_deleted
    before update on views
    when OLD.is_deleted = 1
begin
    select raise (abort, 'entity updates not allowed once is_deleted flag is set.');
end;

-- Disable history updates
create trigger if not exists views_block_history_updates
    before update on views_history
begin
    select raise (abort, 'history updates are not allowed.');
end;
