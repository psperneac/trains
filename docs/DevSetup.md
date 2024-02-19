# Development Setup


# Misc

## Unit tests

- Unit test the highest component that can be tested and would provide coverage for underlying components. Eg for
  controllers,
  make a test at controller level that tests the controller and the service and mocks the repoistory

## Code snippets

### [Postgres earth distance module](https://www.postgresql.org/docs/9.2/earthdistance.html)

```sql
-- toronto
select ll_to_earth(43.651070, -79.347015);
-- montreal east
select ll_to_earth(45.630001, -73.519997);

-- toronto to montreal east
select earth_distance(ll_to_earth(43.651070, -79.347015), ll_to_earth(45.630001, -73.519997));
-- 511251.4492717375 (metres)

-- toronto to timisoara
select earth_distance(ll_to_earth(43.651070, -79.347015), ll_to_earth(45.75372, 21.22571));
--- 7381294.681172046 (metres)
```

- [Class-validator - validating annotations](https://github.com/typestack/class-validator)
- [Nest Readme.md](Docs/Nest.md)
- [NX Readme.md](Docs/NX.md)

## Other dependencies

### Postgres

Main DB

```bash
docker run --name p1 -p 5432:5432 -e POSTGRES_PASSWORD=Admin1! -e POSTGRES_HOST_AUTH_METHOD=password -d postgres
docker ps
docker stop p1
docker ps -a
docker start p1
```

After this run the setup.sql from postgres/postgres

Next update db to latest version for the app. Make sure `liquibase.properties` points to the mysql database.

```bash
cd scripts/liquibase
.\liquibase.bat update
```

### Mysql

Alternate DB - needs some table renaming in models; and or to figure out capitalization of db model

```bash
docker run --name m1 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=Admin1! -d mysql --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
docker ps
docker stop m1
docker ps -a
docker start m1
```

Next update db to latest version for the app. Make sure `liquibase.properties` points to the mysql database.

```bash
cd scripts/liquibase
.\liquibase.bat update
```

### Mongo

Aux DB.

```bash
docker pull mongo
docker network create --driver bridge mongo_nw
docker run -p 27017:27017 --network=mongo_nw -itd --name=m1 mongo

docker stop m1
docker ps -a
docker start m1
```

```bash
docker run -d -p 27017:27017 --name mongo1 -e MONGODB_INITDB_ROOT_USERNAME=admin -e MONGODB_INITDB_ROOT_PASSWORD=Admin1! mongo:latest
 ```

```JavaScript
use
trains
db.createUser(
    {
        user: "trains",
        pwd: passwordPrompt(),   // or cleartext password
        roles: [{role: "readWrite", db: "trains"}]
    }
)
```

#### Remote machine

- https://www.cherryservers.com/blog/install-mongodb-ubuntu-22-04

Change to this to give admin permissions:
```
use admin
db.createUser({ user: "mongoadmin" , pwd: "mongoadmin", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})
```

## Fonts

To view font contents, go here

https://fontdrop.info/