DROP USER IF EXISTS trains;
DROP DATABASE IF EXISTS trains;

CREATE DATABASE trains DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trains'@'%' IDENTIFIED BY 'trains1!';
GRANT ALL ON trains.* to trains;
SET SESSION time_zone = UTC;