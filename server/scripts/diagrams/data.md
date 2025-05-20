# Data


```
Players: [
  { id: 'player1' },
  { id: 'player2' },
  { id: 'player3' }
]
```

## MapTemplate

a map template gives a name to a collection of places, connections and vehicles

```
MapTemplate: [
  { id: 'mapTemplate1' },
  { id: 'mapTemplate2' }
]
```

## Place

all possible places for all maps are defined in a collection

```
Place: [
  { id: 'place1', name: 'name1', lat: 0, lng: 0 },
  { id: 'place2', name: 'name2', lat: 0, lng: 0 },
  { id: 'place3', name: 'name3', lat: 0, lng: 0 },
  { id: 'place4', name: 'name4', lat: 0, lng: 0 }
]
```

## PlaceConnection

all possible place connections for all maps are defined in a collection

```
PlaceConnection: [
  { id: 'conn1', start: 'place1', end: 'place2' },
  { id: 'conn2', start: 'place1', end: 'place3' },
  { id: 'conn3', start: 'place1', end: 'place4' },
  { id: 'conn4', start: 'place3', end: 'place4' }
]
```

## MapPlace & MapConnection

attaches places to a map template. you can have templates with only some of the places and connections.

when a game is started, a Map is made based on a MapTemplate which becomes the base of the game. all extra information is then kept in Instance objects which refect in-game data.

```
MapPlace: [
  { id: 'mapPlace1', place_id: 'place1', map_id: 'mapTemplate1' },
  { id: 'mapPlace2', place_id: 'place2', map_id: 'mapTemplate1' },
  { id: 'mapPlace3', place_id: 'place3', map_id: 'mapTemplate1' },
  { id: 'mapPlace4', place_id: 'place4', map_id: 'mapTemplate1' },
  { id: 'mapPlace11', place_id: 'place1', map_id: 'mapTemplate2' },
  { id: 'mapPlace12', place_id: 'place2', map_id: 'mapTemplate2' },
  { id: 'mapPlace13', place_id: 'place3', map_id: 'mapTemplate3' },
  { id: 'mapPlace14', place_id: 'place4', map_id: 'mapTemplate4' },
]

MapConnection: [
  { id: 'mapConn1',  place_connection_id: 'conn1', map_id: 'mapTemplate1' },
  { id: 'mapConn11', place_connection_id: 'conn1', map_id: 'mapTemplate2' },
  { id: 'mapConn12', place_connection_id: 'conn2', map_id: 'mapTemplate2' }
]

```