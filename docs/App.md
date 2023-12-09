# Trains App

## Models

### Example

Vehicle Name, Configuration, Cargo, Miles, Speed

TRAIN
- Steamer 1+1, 8 cars, 250, 50mph
- Express 2+2, 8 cars, 300, 100mph
- Standard 3+2, 12 cars, 600, 87mph

SHIP

- Small Feeder 1, 1000, 10000, 10mph
- Feeder 1, 2000, 20000, 15mph
- Panamax 1, 5000, 100000, 20mph
- Post panamax 1, 10000, 100000, 18mph
- ULVC 1, 14500, 250000, 18mph

TRUCK
- Town 1, 1, 200, 50mph
- Single 1, 1, 600, 60mph
- Double 1, 2, 1000, 75mph
- Long 2, 2, 1500, 65mph

### Domain

#### User

General user properties, username, email, password hash

#### Player

1-1 with user (??? multiple players per user could be useful) but contains info pertaining to game assets
- id
- name
- description
- assets* 
  - type
  - amount
- mapInstance
- placeInstance* - all the places the player has bought and might have inventory in
- vehicleInstance* - all the vehicles the player has bought and might have inventory in
- connections - all the connections the player has bought

#### Map

general map 

- place* - all the possible places on the map
- connection* - all the possible connections on the map
 
#### Place

A place on the map with a type of access; ie TRAIN, AIR, AUTO, SHIP, MIXED

- id
- name
- description
- lat, lng
- type: TRAIN, AIR, AUTO, SHIP, MIXED
- other/content - eg what kind of jobs it can spawn

#### PlaceInstance

a place with jobs attached to it

- id
- place
- job* - all the jobs left in inventory at a place
- jobOffer* - all the jobs offered to a player at a place
- jobOfferExpire - when the job offers expire and are regenerated
- content - extra settings in json

#### PlaceConnection

- id
- name
- description
- type
- start, end
- content: points along the way and other

#### Vehicle

Vehicle templates.

- id
- name
- description
- type: TRAIN, AIR, AUTO, SHIP, MIXED
- characteristics; speed, fuel, load
- content - json for extra settings

#### VehicleInstance

A vehicle a player owns that carries jobs. Depending on the values of startTime/endTime and startPlace/endPlace a 
vehicle can be in movement or parked at a place.

- id
- vehicle
- jobs* - all the jobs the vehicle is carrying
- startTime - the start time a vehicle left a place
- endTime - the end time a vehicle will arrive at a place
- startPlace - the place a vehicle left from
- endPlace - the place a vehicle will arrive at

#### Job

A job that can be carried by a vehicle or parked at a place. A job has a start and end place and a payment that is 
received when the job is delivered.

Jobs can exist in assigned state, when they are either associated with a vehicle instance, stored in a place when they
are associated with a place instance or offered to a player in a place instance.

- id
- name
- description
- load - number of containers
- type - the type of the job
  - might have to be expanded in a table of types
  - render image etc
  - description of type
- startPlace, endPlace - where the job originated and where it needs to be delivered
- pay, pay_type - how much the job pays and what currency
- startTime - when the job was created - can influence the pay or decrease the pay
- content - for extra settings

### Misc

#### Translation

Table of translation strings. B/E will cache this so it doesn't have to keep loading it from DB.

## .plan

### General

- research more transportation game names
- research features for the rest of transportation games found
- make list of features desired in this game
- filter list of features and decide on features for V0
- filter list of features and decide on features for V1 and future
- on each feature, try to figure out how to implement to make data model flexible enough to allow said feature

### Sprints

#### MVE

- USER
  - can create a player
- PLAYER
  - user can select a player to play with
  - sees map with currently owned places, connections and potential places and connections
  - can buy places and connections
  - can see jobs in a place
  - can see vehicle instances in a place and their inventory
  - can send a vehicle from one place to another on the map
  - can load jobs to a vehicle and unload jobs from a vehicle
  - when a vehicle arrives at a place (even in passing) jobs ending at that place are removed and payment is received
  - when offered jobs in a place expire, new jobs are generated
  - can create a player

### Client

- _ ? move layout to App component
- X add multiple pages to menu, make Content component switch to pages on menu clicks
- _ figure out how to have menu be served by Server
- X add places list screen and create/edit place using map for location (ADMIN)
- _ add ADMIN editor for main map template - use map for selecting places to connect.
- _ add USERS editor for map routes bought - use map to select already created connections from main map

### Server

- X finish Places controller
- _ add resource for vehicles types and figure out attributes to be held for vehicles
- _ add resource for owned vehicles by a user
- _ add resource for currency and other general attributes of a user
- _ add Maps table with jsonb field for connections array
    - _ add resource for route between 2 points
    - _ add special map entry for the main map template
    - _ user map = map entry is for 'bought' connections which are applied on top of map
    - _ figure out data model for map, based on main map and user map
    - _ figure out queries to be done for a map (additionally figure out a library for graph functions)
        - what connections are from place x
        - what free/bought connection are from place x
        - is x to y connected (graph traversal)
- _ figure out table for connection attributes (price, fuel etc)
    - should this be a separate table, or should these be attributes on the main map?

### TechDebt

- X add unit tests on controller
- _ make a stress test tool to hit endpoints
- _ add layer to count API hits and gather statistics on API hits (there is probably a standard library to do this;
  figure
  out how to collect data and where to put it)
- _ make plan and test replacing DB with Mongo and Cassandra (advantages/disadvantages) which one would allow the
  codebase/data model to be similar with one used on postgres and allow switching in production
- _ research using 2 databases in nestjs
- _ add audit feature for all api changes
- _ research implementing audit in another db than main db
- _ figure out jobs service - does it need to be in main server or can it be a different service (initial implementation
  in main server, moving out is main server is overwhelmed?)
- _ research deployment options (heroku?)
    - price of deployment for testing
    - automatic deployment from github

## Features

## Other transportation games

- [Pocket Trains / Pocket Planes](../../trains-docs/PocketTrains.md)
- [Transport Tycoon](TransportTycoon.md)
- [OpenTTD](OpenTtd.md) - https://www.openttd.org/
- [The Sea Game??](SeaUnknownGame.md)
- [Privateer](Privateer.md)
