
create table if not exists vaults (
	id text not null primary key,
	display_name ext not null,
	path text not null,
	created_at text not null default (strftime('%FT%R:%fZ')),
	updated_at text not null default (strftime('%FT%R:%fZ'))
)
