# Models

## Domain

## User

General user properties, username, email, password hash

## Player

1-1 with user (??? multiple players per user could be useful) but contains info pertaining to game assets

### Place

- A place on the map with a type of access; ie TRAIN, AIR, AUTO, SHIP, MIXED

### Vehicle type

- named list of vehicles
- type: TRAIN, AIR, AUTO, SHIP
- name: Dacia Sandero
- template characteristics; speed, fuel, etc
- description

### Vehicle

Vehicles a player owns.

- *->1 VehicleType
- *->1 Player

Can be held as json field in Player

## Misc

### Translation

Table of translation strings. B/E will cache this so it doesn't have to keep loading it