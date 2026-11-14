/**
00-setup.sql
  Initial setup of documents and documents_versions tables including triggers for...
  - basic validation of inserts/updates (not exhaustive at all!)
  - automatically managing createdAt/updatedAt timestamps for documents
  - creating version records on document insert or update
  - inserting or updating documents if new/newer versions are inserted
  - preventing updates of versions
  - preventing deletion of current document version
  - deleting all versions when document is deleted

  Possible error identifiers:
  - M_DENIED_VERSIONS_IMMUTABLE
  - M_DENIED_LATEST_VERSION_DELETE
  - M_DENIED_PURGE_BEFORE_DELETE
*/

pragma user_version = 1;

create table documents (
    id text primary key,
    vid text not null,
    type text not null,
    data json,
    blob blob,
    createdAt text not null default (strftime('%FT%R:%fZ', 'now')),
    updatedAt text not null default (strftime('%FT%R:%fZ', 'now')),
    deleted boolean,
    constraint documents_vid_unique unique (vid)
);
create index documents_by_type on documents(type);

create table documents_versions (
    id text not null,
    vid text primary key,
    type text not null,
    data json,
    blob blob,
    createdAt text not null,
    updatedAt text not null,
    deleted boolean
);
create index documents_versions_by_id on documents_versions(id);

/*
 Create Documents
 ================
 */
create trigger documents_after_insert
after insert on documents
begin
    insert into documents_versions (id, vid, type, data, blob, createdAt, updatedAt)
    values (new.id, new.vid, new.type, new.data, new.blob, new.createdAt, new.updatedAt)
    on conflict do nothing; -- ignore when document is written from version insert
end;

/*
 Update Documents
 ================
 */
create trigger documents_before_update
    -- Limit columns to allow documents_after_update trigger to auto update updatedAt
    before update of type,data,blob,deleted on documents
begin
    select case when old.vid = new.vid then
        raise(abort, 'M_INVALID_MISSING_VID')
    end;
end;

create trigger documents_after_update
    -- Limit columns which trigger this to avoid recursion when auto updating updatedAt
    after update of vid, type, data, blob, deleted on documents
begin
    update documents
    set updatedAt=strftime('%FT%R:%fZ', 'now')
    where id=new.id and old.updatedAt = new.updatedAt;

    insert into documents_versions (id, vid, type, data, blob, createdAt, updatedAt, deleted)
    -- todo: will updatedAt always match document update above? seems that was in testing so far at least
    values (new.id, new.vid, new.type, new.data, new.blob, new.createdAt, strftime('%FT%R:%fZ', 'now'), new.deleted)
    on conflict do nothing; -- ignore as the document update may originate in documents_versions_after_insert
end;

/*
 Delete Documents
 ================
 */
create trigger documents_before_delete
    before delete on documents
begin
    select case when old.deleted = false or old.deleted is null then
        raise(abort, 'M_DENIED_PURGE_BEFORE_DELETE')
    end;
end;

create trigger documents_after_delete
    after delete on documents
begin
    delete from documents_versions where id = old.id;
end;

/**
  Create Version
  ==============
*/
create trigger documents_versions_after_insert
    after insert on documents_versions
begin
    insert into documents (id, vid, type, data, blob, createdAt, updatedAt, deleted)
    values (new.id, new.vid, new.type, new.data, new.blob, new.createdAt, new.updatedAt, new.deleted)
    on conflict do
        update set vid=new.vid, type=new.type, data=new.data, blob=new.blob, createdAt=new.createdAt, updatedAt=new.updatedAt, deleted=new.deleted
        where id = new.id and updatedAt < new.updatedAt;
end;

/**
  Update Version (to allow tombstone deletion)
  ==============
*/
create trigger documents_versions_before_update
    before update on documents_versions
begin
    -- Prevent versions from being restored once deleted
    select case when old.deleted = true then
        raise(abort, 'M_DENIED_VERSIONS_IMMUTABLE')
    end;

    -- Prevent deletion of latest document version
    select case when (select vid from documents where id = old.id) = old.vid then
        raise(abort, 'M_DENIED_LATEST_VERSION_DELETE')
    end;

    -- Prevent updates which mutate version data
    select case when (
        old.id != new.id or
        old.type != new.type or old.data != new.data or old.blob != new.blob or
        old.createdAt != new.createdAt or old.updatedAt != new.updatedAt
    ) then
        raise(abort, 'M_DENIED_VERSIONS_IMMUTABLE')
    end;
end;

/**
  Delete Versions
  ==============
*/
create trigger documents_versions_before_delete
    before delete on documents_versions
begin
    -- Prevent purge before soft deletion, unless document has been purged
    select case when (old.deleted = false or old.deleted is null) and (select vid from documents where id = old.id) is not null then
        raise(abort, 'M_DENIED_PURGE_BEFORE_DELETE')
    end;

    -- Prevent deletion of latest document version
    select case when (select vid from documents where id = old.id) = old.vid then
        raise(abort, 'M_DENIED_LATEST_VERSION_DELETE')
    end;
end;
