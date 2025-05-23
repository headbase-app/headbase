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
    Object Versions Table
    -----------
    Used to store vault object versions.
*/
CREATE TABLE IF NOT EXISTS versions (
    vault_id UUID NOT NULL,
    spec VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    object_id UUID NOT NULL,
    id UUID NOT NULL,
    previous_version_id UUID,
    created_at TIMESTAMPTZ NOT NULL,
    created_by VARCHAR(50) NOT NULL,
    protected_data TEXT,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT versions_pk PRIMARY KEY (id),
    CONSTRAINT versions_vault FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);
