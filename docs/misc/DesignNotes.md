# Notes:

- Multi-tenant architecture where each game is a tenant
- Some games are template games, some are playable games
  - games have a type and access mask which would make them accessible to only admins and certain users for preparing a template
    - Game type: TEMPLATE, PLAYABLE, 
  - information about all games
- Collection for users and common information
- VehicleInstance and PlaceInstance are the collections, jobs are merged into these entities
- types for everything are static objects defined by backend, not in DB

## Game management

- admin has possibility to clone/copy game
- games when copied become TEMPlATE - editable by admin and ACL list
- when admin wants to start a game, it makes the game PLAYABLE

## Vehicle instance

- a vehicle owned by a player. can be one of Vehicle, but it can have upgrades for which player pays
- it becomes its own object, new to the game
- a vehicle instance has a list of jobs attached to it: 'jobs on vehicle'

## PlaceInstance

- not a new object, one player - linked to a Place
- exists to hold the jobs left by player at a place and the job offers the player sees at that place
- in general players see all places and place connections on a map

### Enhancement
- could be enhanced in the future to require licences to see them
- could be enhanced in the future to allow upgrades
- could be enhanced in future to allow ownership and rights - these would go directly in Place/PlaceConnection not in *Instance*
- instance can also hold an inventory of parts used for industry - consumable by the place
- instance would also have some other upgradeable things, like capacity - think warehouse capacity, or factory level

## Game Enhancements
- 'gangs'/'corporations' - multiple players band together to own or control things on the map
- places and connections created by players and owned by them
- ownership / rental of places