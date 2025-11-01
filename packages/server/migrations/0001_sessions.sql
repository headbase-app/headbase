--- Migrating to use server sessions rather than stateless tokens.

--> statement-breakpoint
/**
	Sessions Table
	-----------
	Used to store user sessions.
*/
create table sessions (
	token varchar(64) not null,
	id uuid default uuid_generate_v4() not null,
	user_id uuid not null,
	expires_at timestamp with time zone not null,
	constraint sessions_pk primary key (token),
	constraint sessions_user foreign key (user_id) references users(id) on delete cascade
);
