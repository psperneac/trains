use system_schema;
create user if not exists trains with password 'trains1!' superuser;
create keyspace if not exists trains
    WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 3};

use trains;

create table if not exists users(
                      id UUID PRIMARY KEY,
                      created timestamp,
                      modified timestamp,
                      username text,
                      password text,
                      first_name text,
                      last_name text,
);

insert into users (id, created, modified, username, password, first_name, last_name) values (uuid(), dateof(now()), dateof(now()), 'paul', 'paul1!', 'Paul', 'Sperneac');
insert into users (id, created, modified, username, password, first_name, last_name) values (uuid(), dateof(now()), dateof(now()), 'gabi', 'gabi1!', 'Gabi', 'Sperneac');

select * from users;
-- drop table users;
-- drop keyspace trains;
-- drop user trains;