-- PostgreSQL Database Setup Script

-- 1. Create the Database (Run this as a superuser, e.g., 'postgres')
SELECT 'CREATE DATABASE "hr-app"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hr-app')\gexec

-- 2. Optional: Create a dedicated user if not using 'postgres'
-- Uncomment and run the following if you want a separate user:
/*
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hr_user') THEN
        CREATE ROLE hr_user WITH LOGIN PASSWORD 'your_secure_password';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE "hr-app" TO hr_user;
*/

\c "hr-app"

-- 3. The schema will be managed by Prisma, so you don't need to manually create tables.
-- On the server, you will run: npx prisma db push
