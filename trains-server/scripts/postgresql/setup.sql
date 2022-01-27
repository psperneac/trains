create database trains;
create user trains with password 'trains1!';
grant all privileges on database trains to trains;
alter user trains with SUPERUSER;

-- run this connected as trains to trains

