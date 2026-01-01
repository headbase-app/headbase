
create table if not exists vaults (
	id                       text not null primary key,
	name                     text not null,
	protected_encryption_key text not null,
	protected_data           text,
	created_at               text not null default (strftime('%FT%R:%fZ')),
	updated_at               text not null default (strftime('%FT%R:%fZ')),
	deleted_at               text
)
