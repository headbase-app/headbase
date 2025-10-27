-- Switch to database
\c headbase

-- Grant all privileges to all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO headbase;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO headbase;
