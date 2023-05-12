drop table if exists seq100;
create temporary table seq100
(x int not null auto_increment primary key);
insert into seq100 values (),(),(),(),(),(),(),(),(),();
insert into seq100 values (),(),(),(),(),(),(),(),(),();
insert into seq100 values (),(),(),(),(),(),(),(),(),();
insert into seq100 values (),(),(),(),(),(),(),(),(),();
insert into seq100 values (),(),(),(),(),(),(),(),(),();
insert into seq100 select x + 50 from seq100;
select * from seq100;

drop table if exists temp_table_name
CREATE TEMPORARY TABLE temp_table_name
(
    ID      varchar(36) default (uuid())          not null primary key,
    version integer default 1,
    CREATED datetime    default CURRENT_TIMESTAMP not null,
    UPDATED datetime    default CURRENT_TIMESTAMP not null
);
insert into temp_table_name select uuid(), 1, current_timestamp, current_timestamp from seq100;
select * from temp_table_name
