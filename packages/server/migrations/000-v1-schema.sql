-- Create UUID extension for uuid_generate_v4 support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically manage updated_at timestamps
CREATE OR REPLACE FUNCTION update_table_timestamps()
	RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to delete rows with a created_at timestamp older than the given row
CREATE OR REPLACE FUNCTION delete_older_rows()
	RETURNS TRIGGER AS $$
BEGIN
	EXECUTE format('DELETE FROM %I WHERE created_at < %L;', TG_TABLE_NAME, NEW.created_at);
RETURN null;
END
$$ LANGUAGE 'plpgsql';

/**
	User Role Enum
	----------
	Added to users to control access to resources and actions.
 */
CREATE TYPE user_roles AS ENUM ('user', 'admin');

/**
	Server Settings Table
	-----------
	Used to store dynamic server settings that can't be set via env vars.
*/
CREATE TABLE IF NOT EXISTS settings (
	id UUID NOT NULL DEFAULT uuid_generate_v4(),
	registration_enabled BOOLEAN NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT config_pk PRIMARY KEY (id)
);
CREATE TRIGGER delete_old_settings AFTER INSERT ON settings FOR EACH ROW EXECUTE PROCEDURE delete_older_rows();

/**
	Users Table
	-----------
	Used to store user accounts.
*/
CREATE TABLE IF NOT EXISTS users (
	id UUID NOT NULL DEFAULT uuid_generate_v4(),
	email VARCHAR(100) NOT NULL,
	display_name VARCHAR(50) NOT NULL,
	password_hash VARCHAR(100) NOT NULL,
	verified_at TIMESTAMPTZ,
	first_verified_at TIMESTAMPTZ,
	role user_roles NOT NULL DEFAULT 'user',
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT email_unique UNIQUE (email),
	CONSTRAINT users_pk PRIMARY KEY (id)
);
CREATE TRIGGER update_user_timestamps BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_table_timestamps();

/**
	Vaults Table
	-----------
	Used to store vaults.
*/
CREATE TABLE IF NOT EXISTS vaults (
	owner_id UUID NOT NULL,
	id UUID NOT NULL,
	name VARCHAR(100) NOT NULL,
	protected_encryption_key VARCHAR(500) NOT NULL,
	protected_data TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	deleted_at TIMESTAMPTZ,
	CONSTRAINT vault_name_unique UNIQUE (owner_id, name),
	CONSTRAINT vaults_pk PRIMARY KEY (id),
	CONSTRAINT vault_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TRIGGER update_vault_timestamps BEFORE UPDATE ON vaults FOR EACH ROW EXECUTE PROCEDURE update_table_timestamps();

/**
	Files Table
	-----------
	Used to store file metadata.
*/
CREATE TABLE IF NOT EXISTS files (
	-- Vault the file item belongs to.
	vault_id UUID NOT NULL,
	-- ID (primary key) and previous ID used to track version history.
	id UUID NOT NULL,
	previous_id UUID,
	-- File ID used to track history between different versions.
	file_id UUID NOT NULL,
	-- Parent file ID used to model the file system graph.
	parent_file_id UUID,
	-- The name of the file item.
	name VARCHAR(255) NOT NULL,
	-- If the file is a directory.
	is_directory BOOLEAN NOT NULL,
	-- File contents metadata, used for error checking when reassembling chunks.
	file_hash TEXT NOT NULL,
	file_size BIGINT NOT NULL,
	-- Timestamps
	created_at TIMESTAMPTZ NOT NULL,
	updated_at TIMESTAMPTZ NOT NULL,
	deleted_at TIMESTAMPTZ,
	-- User/device metadata
	created_by VARCHAR(100) NOT NULL,
	updated_by VARCHAR(100) NOT NULL,
	deleted_by VARCHAR(100),
	-- Object store metadata
	saved_at TIMESTAMPTZ,
	CONSTRAINT file_history_pk PRIMARY KEY (id),
	CONSTRAINT file_history_vault FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);

/**
	File Chunks Table
	-----------
	Used to store the chunks of each file.
*/
CREATE TABLE IF NOT EXISTS files_chunks (
	version_id UUID NOT NULL,
	hash TEXT NOT NULL,
	-- The index (0-based) where the chunk fits in the file version.
	index INT NOT NULL,
	CONSTRAINT file_versions_chunks_version FOREIGN KEY (version_id) REFERENCES file_versions(id) ON DELETE CASCADE
);
