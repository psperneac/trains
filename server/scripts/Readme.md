# PostgreSql

https://hub.docker.com/_/postgres/

## Operations

### Run from command line

```bash
docker run --name p1 -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

# Cassandra
## Operations
### Building the image

```bash

```

### Running the image for the first time

```bash
docker run --name c1 -p 9042:9042 -p 7000:7000 -p 7001:7001 -p 7199:7199 -p 9160:9160 -d ikarsoft/cassandra

# to remove the container
docker rm c1

# to list container
docker ps
docker ps -a # when container is not started
```

### Start/Stop

```bash
docker start c1
docker stop c1
```

# Test data

## Places

```json
[
    {
        "name": "Timisoara Nord",
        "description": "railway station in Timisoara, Romania",
        "type": "RAIL",
        "lat": 45.7499191,
        "long": 21.2009562
    },
    {
        "name": "Timisoara Traian Vuia International Airport",
        "description": "airport in Timisoara, Romania",
        "type": "RAIL",
        "lat": 45.8095903,
        "long": 21.3203268
    },
]
```
