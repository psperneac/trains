# Development Setup

# Misc

## Unit tests

- Unit test the highest component that can be tested and would provide coverage for underlying components. Eg for
  controllers,
  make a test at controller level that tests the controller and the service and mocks the repoistory

## Code snippets

### Mongo

[install mongo in k8s](../deploy/README.md)

create app database:

```JavaScript
use trains
db.createUser(
    {
        user: "trains",
        pwd: passwordPrompt(),   // or cleartext password
        roles: [{role: "readWrite", db: "trains"}]
    }
)
```

Make sure when connecting that the authSource is inside the new database: `mongodb://trains:trains1!@localhost:30017/?authSource=trains`

Add another user with admin permissions:
```
use admin
db.createUser({ user: "mongoadmin" , pwd: "mongoadmin", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})
```

## Fonts

To view font contents, go here

https://fontdrop.info/
