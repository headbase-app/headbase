
create table if not exists vaults (
    hbv text not null,
    id text not null primary key,
    created_at text not null default (strftime('%FT%R:%fZ')),
    updated_at text not null default (strftime('%FT%R:%fZ')),
    deleted_at text,
    name text not null,
    encryption_key text not null,
    data text,
    owner_id text,
    sync_enabled int,
    last_synced_at text
);
