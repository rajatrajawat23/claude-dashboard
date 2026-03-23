-- Claude Dashboard Database Initialization
-- This runs on first postgres container start

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes that GORM might not create
-- (GORM handles table creation via AutoMigrate)

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE claude_dashboard TO postgres;
