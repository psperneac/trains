- [App Docs / Design](App.md)
- [TrainsWeb - ui](#TrainsWeb)
- [TrainsServer - backend](#TrainsServer)
- [NEST](#Nest)

# TrainsWeb

```bash
cd trains-web
npm i
npm run start
```

- https://leafletjs.com/
    - https://github.com/Asymmetrik/ngx-leaflet/ - map components
- https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- https://ultimatecourses.com/blog/component-events-event-emitter-output-angular-2
- https://medium.com/runic-software/the-simple-guide-to-angular-leaflet-maps-41de83db45f1 - series of articles on adding
  custom controls to maps

# TrainsServer

```bash
cd trains-server
cd scripts/liquibase
./liquibase.bat update
cd ../..
npm i
npm run start
```

# Postgres

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

# Mysql

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

# Mongo

```bash
docker pull mongo
docker network create --driver bridge mongo_nw
docker run -p 27017:27017 --network=mongo_nw -itd --name=m1 mongo

docker stop m1
docker ps -a
docker start m1
```

# Misc

## Resources

- [Nest tutorial](https://wanago.io/courses/api-with-nestjs/)
- [Nest tutorial code](https://github.com/mwanago/nestjs-typescript)
- https://wanago.io/2020/07/06/api-nestjs-unit-tests/ - writing unit test
- https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/ - testing services and
  controllers with integration tests
- [TypeOrm](https://github.com/typeorm/typeorm)

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

## Unit tests

- Unit test the highest component that can be tested and would provide coverage for underlying components. Eg for
  controllers,
  make a test at controller level that tests the controller and the service and mocks the repoistory
