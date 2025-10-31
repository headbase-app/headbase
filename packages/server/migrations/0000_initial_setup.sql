-- Initial migration to set up database, created manually.

/**
  Function to automatically manage updated_at timestamps
 */
create or replace function update_table_timestamps()
	returns trigger as $$
begin
	NEW.updated_at = now();
	return NEW;
end ;
$$ language 'plpgsql';

/**
  Function to delete rows with a created_at timestamp older than the given row
 */
create OR replace function delete_older_rows()
	returns trigger as $$
begin
	execute format('DELETE FROM %I WHERE created_at < %L;', TG_table_NAME, NEW.created_at);
	return null;
end
$$ language 'plpgsql';

/**
	User Role Enum
	----------
	Added to users to control access to resources and actions.
 */
create type user_roles as enum ('user', 'admin');

--> statement-breakpoint
/**
	Server Settings Table
	-----------
	Used to store dynamic server settings that can't be set via env vars.
*/
create table settings (
	"id" uuid default uuid_generate_v4() not null,
	"registration_enabled" boolean not null,
	"created_at" timestamp with time zone default now() not null,
	constraint settings_pk primary key (id)
);
create trigger delete_old_settings after insert on settings for each row execute procedure delete_older_rows();

--> statement-breakpoint
/**
	Users Table
	-----------
	Used to store user accounts.
*/
create table users (
	"id" uuid default uuid_generate_v4() not null,
	"email" varchar(100) not null,
	"display_name" varchar(50) not null,
	"password_hash" varchar(100) not null,
	"verified_at" timestamp with time zone,
	"first_verified_at" timestamp with time zone,
	"role" "user_roles" default 'user' not null,
	"created_at" timestamp with time zone default now() not null,
	"updated_at" timestamp with time zone default now() not null,
	constraint users_pk primary key (id),
	constraint email_unique unique (email)
);
create trigger update_user_timestamps before update on users for each row execute procedure update_table_timestamps();

--> statement-breakpoint
/**
	Vaults Table
	-----------
	Used to store vaults.
*/
create table vaults (
	"id" uuid not null,
	"name" varchar(100) not null,
	"protected_encryption_key" varchar(500) not null,
	"protected_data" text,
	"created_at" timestamp with time zone default now() not null,
	"updated_at" timestamp with time zone default now() not null,
	"deleted_at" timestamp with time zone,
	"owner_id" uuid not null,
	constraint vaults_pk primary key (id),
	constraint vault_name_unique unique (owner_id, name),
	constraint vault_owner foreign key (owner_id) references users(id) on delete cascade
);
create trigger update_vault_timestamps before update on vaults for each row execute procedure update_table_timestamps();

--> statement-breakpoint
/**
	Files Table
	-----------
	Used to store file metadata.
*/
create table files (
	"vault_id" uuid not null,
	"version_id" uuid not null,
	"previous_version_id" uuid,
	"file_id" uuid not null,
	"parent_file_id" uuid,
	"is_directory" boolean not null,
	"file_name" varchar(255) not null,
	"file_hash" text not null,
	"file_size" integer not null,
	"created_at" timestamp with time zone not null,
	"updated_at" timestamp with time zone not null,
	"deleted_at" timestamp with time zone,
	"created_by" varchar(100) not null,
	"updated_by" varchar(100) not null,
	"deleted_by" varchar(100),
	"committed_at" timestamp with time zone,
	constraint files_pk primary key (version_id),
	constraint files_vault foreign key (vault_id) references vaults(id) on delete cascade
);

--> statement-breakpoint
/**
	File Chunks Table
	-----------
	Used to store the chunks of each file.
*/
create table files_chunks (
	"version_id" uuid not null,
	"chunk_hash" text not null,
	"file_position" integer not null,
	constraint files_chunks_pk primary key (chunk_hash),
	constraint files_chunks_file foreign key (version_id) references files(version_id) on delete cascade
);
