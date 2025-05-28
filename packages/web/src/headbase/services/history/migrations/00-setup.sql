
create table if not exists history (
    id text not null primary key,
    previous_version_id text,
    created_at text not null default (strftime('%FT%R:%fZ')),
    deleted_at text,
    path text not null,
    type text not null,
    device text not null,
    content text,
    content_hash text
);
