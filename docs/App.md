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

### User

General user properties, username, email, password hash

### Player

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

### Map

general map 

- place* - all the possible places on the map
- connection* - all the possible connections on the map
 
### Place

A place on the map with a type of access; ie TRAIN, AIR, AUTO, SHIP, MIXED

- id
- name
- description
- lat, lng
- type: TRAIN, AIR, AUTO, SHIP, MIXED
- other/content - eg what kind of jobs it can spawn

### PlaceInstance

a place with jobs attached to it

- id
- place
- job* - all the jobs left in inventory at a place
- jobOffer* - all the jobs offered to a player at a place
- jobOfferExpire - when the job offers expire and are regenerated
- content - extra settings in json

### PlaceConnection

- id
- name
- description
- type
- start, end
- content: points along the way and other

### Vehicle

Vehicle templates.

- id
- name
- description
- type: TRAIN, AIR, AUTO, SHIP, MIXED
- characteristics; speed, fuel, load
- content - json for extra settings

### VehicleInstance

A vehicle a player owns that carries jobs. Depending on the values of startTime/endTime and startPlace/endPlace a 
vehicle can be in movement or parked at a place.

- id
- vehicle
- jobs* - all the jobs the vehicle is carrying
- startTime - the start time a vehicle left a place
- endTime - the end time a vehicle will arrive at a place
- startPlace - the place a vehicle left from
- endPlace - the place a vehicle will arrive at

### Job

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

### Translation

Table of translation strings. B/E will cache this so it doesn't have to keep loading it from DB.


## Features

## Other transportation games

- [Pocket Trains / Pocket Planes](../../trains-docs/PocketTrains.md)
- [Transport Tycoon](TransportTycoon.md)
- [OpenTTD](OpenTtd.md) - https://www.openttd.org/
- [The Sea Game??](SeaUnknownGame.md)
- [Privateer](Privateer.md)

## Resources

- https://www.openrailwaymap.org/ - trains lines - no routes
- https://maps.openrouteservice.org/ - routes w/o trains
- https://github.com/perliedman/leaflet-routing-machine - old leaflet routing 
- react-leaflet-routing-machine - unknown how old, can't find repo