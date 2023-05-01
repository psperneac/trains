# Models

## Example

Vehicle Name, Configuration, Cargo, Miles, Speed

TRAIN
Steamer 1+1, 8 cars, 250, 50mph
Express 2+2, 8 cars, 300, 100mph
Standard 3+2, 12 cars, 600, 87mph

SHIP
Small Feeder 1, 1000, 10000, 10mph
Feeder 1, 2000, 20000, 15mph
Panamax 1, 5000, 100000, 20mph
Post panamax 1, 10000, 100000, 18mph
ULVC 1, 14500, 250000, 18mph

TRUCK
Town 1, 1, 200, 50mph
Single 1, 1, 600, 60mph
Double 1, 2, 1000, 75mph
Long 2, 2, 1500, 65mph

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