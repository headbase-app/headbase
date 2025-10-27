-- Cleaning up existing internal if present
DROP DATABASE IF EXISTS headbase;

-- Cleaning up existing user if present
DROP USER IF EXISTS headbase;

-- Create headbase user and internal
CREATE USER headbase WITH PASSWORD 'password' LOGIN;
CREATE DATABASE headbase;
GRANT CONNECT ON DATABASE headbase TO headbase;

-- Switch to new database
\c headbase

-- Grant privileges to lfb user after everything is created
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO headbase;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO headbase;
