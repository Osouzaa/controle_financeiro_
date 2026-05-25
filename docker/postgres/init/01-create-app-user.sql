DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'financeiro_user') THEN
    CREATE ROLE financeiro_user LOGIN PASSWORD 'financeiro_pass';
  END IF;
END
$$;

ALTER DATABASE financeiro OWNER TO financeiro_user;
GRANT ALL PRIVILEGES ON DATABASE financeiro TO financeiro_user;

\connect financeiro

GRANT USAGE, CREATE ON SCHEMA public TO financeiro_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO financeiro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO financeiro_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO financeiro_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO financeiro_user;
