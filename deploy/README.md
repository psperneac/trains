# Local

```
k apply -f mongo-secret.local.yaml
k apply -f mongo-deployment.local.yaml
k apply -f mongo-service.local.yaml
# port forward
kubectl port-forward service/mongodb-service 37017:27017
# connect with compass on mongodb://admin:Admin1!@localhost:37017
mongosh "mongodb://admin:Admin1!@localhost:37017"
```
