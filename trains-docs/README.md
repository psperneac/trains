- [App Docs / Design](App.md)
- [TrainsWeb - ui](#TrainsWeb)
- [TrainsServer - backend](#TrainsServer)
- [NEST](#Nest)
- [Resources](#Resources)
- [Misc](Misc.md)
- [Development Guidelines](Development.md)

# Log

- ! figure out a way how to navigate away from an edit after Save is clicked and is successful and print error on screen if not successful

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

# Trains React Web

- https://react-data-table-component.netlify.app/?path=/docs/getting-started-examples--page 
- https://react-bootstrap.netlify.app/
- Translations: https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-react-app-with-react-i18next

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

# Resources

- [Nest tutorial](https://wanago.io/courses/api-with-nestjs/)
- [Nest tutorial code](https://github.com/mwanago/nestjs-typescript)
- https://wanago.io/2020/07/06/api-nestjs-unit-tests/ - writing unit test
- https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/ - testing services and
  controllers with integration tests
- [TypeOrm](https://github.com/typeorm/typeorm)
- [Helm](https://helm.sh/docs/) - for deployments
    - [Helm how to delete deployment](https://phoenixnap.com/kb/helm-delete-deployment-namespace)
- [Scoop](https://scoop.sh/#/) - command line installer for windows - a-la Brew - `scoop install nodejs`


