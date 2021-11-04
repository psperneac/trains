# Docs

## .plan

### General

- research more transportation game names
- research features for the rest of transportation games found
- make list of features desired in this game
- filter list of features and decide on features for V0
- filter list of features and decide on features for V1 and future
- on each feature, try to figure out how to implement to make data model flexible enough to allow said feature

### Client
- move layout to App component
- add multiple pages to menu, make Content component switch to pages on menu clicks
- figure out how to have menu be served by Server
- add places list screen and create/edit place using map for location
- add ADMIN editor for main map template - use map for selecting places to connect. 
- add USERS editor for map routes bought - use map to select already created connections from main map

### Server

- finish Places controller
- add Maps table with jsonb field for connections array
- add special map entry for the main map template
- user map = map entry is for 'bought' connections which are applied on top of map
- figure out data model for map, based on main map and user map
- figure out queries to be done for a map (additionally figure out a library for graph functions)
  - what connections are from place x
  - what free/bought connection are from place x
  - is x to y connected (graph traversal)
- figure out table for connection attributes (price, fuel etc)
  - should this be a separate table, or should these be attributes on the main map?
- add table/controller for vehicles types and figure out attributes to be held for vehicles
- add table/controller for owned vehicles by a user
- add table/controller for currency and other general attributes of a user 

### TechDebt

- add unit tests on controller
- make a stress test tool to hit endpoints
- add layer to count API hits and gather statistics on API hits (there is probably a standard library to do this; figure out how to collect data and where to put it)
- make plan and test replacing DB with Mongo and Cassandra (advantages/disadvantages) which one would allow the codebase/data model to be similar with one used on postgres and allow switching in production
- research using 2 databases in nestjs
- add audit feature for all api changes
- research implementing audit in another db than main db
- figure out jobs service - does it need to be in main server or can it be a different service (initial implementation in main server, moving out is main server is overwhelmed?)
- research deployment options (heroku?) 
  - price of deployment for testing
  - automatic deployment from github

## Features

## Other transportation games

[Pocket Trains / Pocket Planes](PocketTrains.md)
[Transport Tycoon](TransportTycoon.md)
[OpenTTD](OpenTtd.md) - https://www.openttd.org/
[The Sea Game??](SeaUnknownGame.md)
[Privateer](Privateer.md)
