-- run as postgres/Admin1!

create database trains;
create user trains with password 'trains1!';
grant all privileges on database trains to trains;
alter user trains with SUPERUSER;

-- run connected as trains to trains
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "autoinc";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";
ALTER USER trains WITH NOSUPERUSER;
