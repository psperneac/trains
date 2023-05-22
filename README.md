# Trains

## .plan

Short term plan on what to add to the app

on May 22nd, 2023

- Add delete to table/list views
- Fix new PlaceConnection errors before start/end are set
- ? Add custome marker class that keeps old state (position) and can trigger through some events reorder of a path
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
- Fix width of PalceConnection edit form
  - Document somewhere how to change layout
- Add map on PlaceConnection list view to see all connections
  - Figure out layout for list view with map
- Add ability to switch between drawing route or not depending on zoom level
- Add zoom events handling in Map and app event emitter for zoom events
- Add marker size depending on zoom level
  - probably MapService.icon* should check zoom level of map and return proper size
- Find way to check if a marker or route is hit when user clicks map

## Terms

- Place - a point on graph where jobs can be obtained, delivered or stored. Also a point in which manufacturing or repair can be done.
- PlaceType - types of places. determines what can happen at the Place
- Vehicle - General vehicle classes that can be obtained. Specific vehicles depend on player and have a base class but can have augmentations. A vehicle contains the general attributes like speed, range, fuel capacity and cargo capacity
- VehicleType - type of vehicles. Determines what connections they can take. eg SHIP type vehicles can only take SHIP connections.
- PlaceConnection - a connection between 2 places. Has a type to determine what kind of vehicles can travel it.
- Route - path between 2 places inside a connection. It contains the detailed points that a vehicle takes. It determines the length of the connection. For simplicity of display route is ignored in some views.