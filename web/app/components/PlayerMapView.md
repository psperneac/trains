# PlayerMapView

This component displays the map for a player in his game screen. It should display the status of the game at one time. It is also used in the process of selecting a route for a vehicle.

## Place Statuses

- **OWNED** - player owns the place
- **OWNED_ON_ROUTE** - player owns the place, place is part of the route the player is selecting
- **OWNED_ROUTABLE** - player owns the place, place is 1 connection away from the end of the route
- **NOT_OWNED** - player doesn't own the place
- **NOT_OWNED_PURCHASEABLE** - in normal view this place is 1 connection away from an owned place thus it can be purchased

**OWNED** and **NOT_OWNED** are basic statuses. **OWNED_ON_ROUTE**, **OWNED_ROUTABLE**, **NOT_OWNED_PURCHASEABLE** are sub-statuses of nodes, which sub-statuses make sense depending on the game mode.

## Connection Statuses

- **INTERNAL** - connection between 2 places the player owns
- **INTERNAL_ON_ROUTE** - connection between 2 places the player owns that are on the route
- **INTERNAL_ROUTABLE** - connection between 2 places the player owns, one end of the connection is the last place in the route
- **EXTERNAL** - connection between 2 places the player doesn't own
- **EXTERNAL_PURCHASEABLE** - connection between a place the player owns and a place the player doesn't own

**INTERNAL** and **EXTERNAL** are basic statuses. **INTERNAL_ON_ROUTE**, **INTERNAL_ROUTABLE**, **EXTERNAL_PURCHASEABLE** are sub-statuses of nodes, which sub-statuses make sense depending on the game mode.

## Game Modes

- **NORMAL** - player sees map and can buy places **NOT_OWNED_PURCHASEABLE**
- **DISPATCH** - player is sending a vehicle from one place to another; is selecting the route

### Normal game mode

The focus of normal map mode is to let users browse the map, purchase new places and click on owned places and vehicles to see details about them.

The map displays owned places in one color, eg red. Connections between owned places are also displayed in red.

Not owned places are displayed in gray with places not purchased but one connection away from an owned place displayed in a darker gray. Same for connections, connections between not owned places are displayed in gray and connections between one owned and one not owned place are displayed in a darker gray.

### Dispatch game mode

The focus in dispatch mode is to show the current route and to help the user pick the next place on the route. Purchasing new places (and thus opening up new connections) is permitted.

- A place on the route is displayed in blue.
- An owned plane not on the route one connection away from the last place on the route is displayed in a darker red.
- Any other owned place is displayed in red.
- A not owned place one connection away from an owned place is displayed in darker gray.
- Any other not owned place is displayed in gray.
- A connection between 2 places on the route is displayed in blue.
- A connection between an owned place not on the route and the last place on the route is displayed indarker red.
- Any other connections between owned places are displayed normal red.
- A connection between an owned place and a not owned place is displayed in normal gray.
- Any other connection between not-owned places is displayed in normal gray.

## Implementation notes

- We should separate in code retrieving the information about places, ownership, connection from the code that encoded the structure that is displayed and further on from the code that sets up the map with places and connections. It is important that the middle part forms a structure that maps naturally to what we show on the map; while at the same time being debuggable / viewable when app is being built.
- The 2 modes of displaying the map should be separated; propose that the middle model is built in separate functions depending on the display mode.

### Current implementation status

The middle layer is implemented inside [PlayerMapView.tsx](PlayerMapView.tsx) as top-level pure functions:

- `buildNormalModel(mapViewData)` — NORMAL-mode encoder. Produces `OWNED` / `NOT_OWNED` / `NOT_OWNED_PURCHASEABLE` for places, `INTERNAL` / `EXTERNAL` / `EXTERNAL_PURCHASEABLE` for connections.
- `buildDispatchModel(mapViewData, options)` — DISPATCH-mode encoder. Adds `OWNED_ON_ROUTE`, `OWNED_ROUTABLE`, `INTERNAL_ON_ROUTE`, `INTERNAL_ROUTABLE` and the green in-progress route polyline.
- `buildModel(mapViewData, mode, options)` — thin dispatcher used by the component.

The `PlaceStatus` and `ConnectionStatus` unions and the `PLACE_COLOR` / `CONNECTION_COLOR` tables at the top of [PlayerMapView.tsx](PlayerMapView.tsx) are the **canonical status table** — the spec text above and the code are kept in lockstep there. Any new status (or color change) should land in both files.

The component itself is a thin renderer over the model: it iterates `model.places` and `model.connections`, projects their pre-resolved `color` / `weight` / `opacity` / `dashArray` onto `Polyline` and `PlaceMarker`, and renders the green route polyline when `model.routePolyline.length >= 2`.

**Debugging the model**: in development, click the `inspect model` button in the bottom-right corner of the map to open a JSON panel showing the live model. This is the supported way to confirm the model matches the spec; `console.log` calls were removed as too noisy.

## Future improvements

- colors, shapes, icons should be make configurable in code; extract these in a config structure at the beginning of the file.
- simplify the handlers if possible; consider using a type-event single handler.
