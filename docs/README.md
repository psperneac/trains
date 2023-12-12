- [App Docs / Design](App.md)
- [Terms](#Terms)
- [System Overview](#SystemOverview)
- [Resources](#Resources)
- [Misc](Misc.md)
- [Development Guidelines](Development.md)

# Log

## TODO

- ! figure out a way how to navigate away from an edit after Save is clicked and is successful and print error on screen if not successful

## .plan

Short term plan on what to add to the app:

- admin defined places and connections
- player wallet / player xp / leveling?
- player can buy places and connections
- player can buy vehicles from predefined list
- jobs appear when player clicks on places at predefined times
- jobs can be loaded to vehicles in a places
- vehicles can be sent to another place
- times arrival at the destination place - vehicle is shown as moving marker on map
- automatic unloading of jobs with destination to that place and payout
- ability to unload any job from a vehicle in a place where a vehicle is
- backup of db data (to csv files?); import of data later while app is running?
- deployment to web / domain etc

Bugs, misc:

- Add delete to table/list views
- ? Add custom marker class that keeps old state (position) and can trigger through some events reorder of a path
- Add marker on edit to show what Save does.
  - some green checkmark somewhere that gets orange on changes, green after successful save, red on error. tooltip is last error. Can be general component that gets selectors and a valid accessor for a type.
- Add all places for cities in Romania
- Add PlaceConnection between cities in Romania (w/o routes atm)
- Add default colour to PlaceConnection 
  - is default colour for an unclaimed connection
- Add script to export db data to importable csv - light backup
  - export places and connections for Romania to importable files
- Add table on PlaceConnection view for route details inside a PlaceConnection
  - allow deleting and moving points within a connection
  - redraw route on any change
  - figure out how to do this in reactive forms
- Fix width of PlaceConnection edit form
  - Document somewhere how to change layout
- Add map on PlaceConnection list view to see all connections
  - Figure out layout for list view with map
  - Same for all lists where it makes sense and main page
  - Reuse same component
- Add ability to switch between drawing route or not depending on zoom level
- Add zoom events handling in Map and app event emitter for zoom events
- Add marker size depending on zoom level
  - probably MapService.icon* should check zoom level of map and return proper size
- Find way to check if a marker or route is hit when user clicks map

## .long-term-plan

- player site in react once angular one is working - admin site remains in angular?
- special types of jobs that give materials or vehicle parts
- manufacturing facilities where vehicles are built when all components or materials are present
- multiplayer - sharing jobs between players
- companies - players can create companies and share jobs between them
- ability to add places and connections on map depending on neighbourhood a player is in - for pay?
- premium features - pay for premium features, extract existing features to premium, add more QOL features for premium
- ability to control sections of maps for player/corporation

# Terms

- Place - a point on graph where jobs can be obtained, delivered or stored. Also a point in which manufacturing or repair can be done.
- PlaceType - types of places. determines what can happen at the Place. enum for now with controller/service.
- Vehicle - General vehicle classes that can be obtained. Specific vehicles depend on player and have a base class but can have augmentations. A vehicle contains the general attributes like speed, range, fuel capacity and cargo capacity
- VehicleType - type of vehicles. Determines what connections they can take. eg SHIP type vehicles can only take SHIP connections. enum for now with controller/service.
- PlaceConnection - a connection between 2 places. Has a type to determine what kind of vehicles can travel it.
  - Route - path between 2 places inside a connection. It contains the detailed points that a vehicle takes. It determines the length of the connection. For simplicity of display route is ignored in some views. Route is saved in contents of PlaceConnection.
- Map - contains the layout of a map with places and connections. MapPlaceConnection and MapPlace are join tables linking Places and PlaceConnections to a Map.
- PlacesInstance - A place that a player has. Links to place and player
- VehicleInstance - A vehicle that a player has. Links to vehicle and player
- PlaceInstanceJob - jobs that a player left in a place instance
- PlaceInstanceJobOffer - jobs offered for a player in a place instance
- VehicleInstanceJob - jobs on a vehicle instance
- PlaceConnectionInstance - place connections that a player has bought
- Player - a player in the game. VehicleInstance, PlaceInstance, PlaceInstanceJob, PlaceInstanceJobOffer, VehicleInstanceJob, PlaceConnectionInstance are all linked to a player

# SystemOverview

## Dependencies

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
cd server/scripts/liquibase
./liquibase.bat update
```

## TrainsWeb

UI for the app - Angular

```bash
cd web
npm i
npm run start
```

- https://leafletjs.com/
    - https://github.com/Asymmetrik/ngx-leaflet/ - map components
- https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- https://ultimatecourses.com/blog/component-events-event-emitter-output-angular-2
- https://medium.com/runic-software/the-simple-guide-to-angular-leaflet-maps-41de83db45f1 - series of articles on adding
  custom controls to maps

## TrainsServer

Data server - Nest.js + DB

```bash
cd server
cd scripts/liquibase
./liquibase.bat update
cd ../..
npm i
npm run start
```
- [Nest tutorial](https://wanago.io/courses/api-with-nestjs/)
- [Nest tutorial code](https://github.com/mwanago/nestjs-typescript)
- https://wanago.io/2020/07/06/api-nestjs-unit-tests/ - writing unit test
- https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/ - testing services and
  controllers with integration tests
- [TypeOrm](https://github.com/typeorm/typeorm)

# Resources

- [Helm](https://helm.sh/docs/) - for deployments
    - [Helm how to delete deployment](https://phoenixnap.com/kb/helm-delete-deployment-namespace)
- [Scoop](https://scoop.sh/#/) - command line installer for windows - a-la Brew - `scoop install nodejs`


