-- Switch to database
\c localful

-- Grant all privileges to all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO localful;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO localful;
