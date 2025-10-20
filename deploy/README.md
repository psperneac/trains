# Local

```
k apply -f mongo-secret.local.yaml
k apply -f mongo-deployment.local.yaml
k apply -f mongo-service.local.yaml
# connect with compass on mongodb://admin:Admin1!@localhost:30017
mongosh "mongodb://admin:Admin1!@localhost:30017"
```
