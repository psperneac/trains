# Kubernetes Service Discovery

## Overview

**Kubernetes has built-in DNS service discovery**. Every Service you create automatically gets registered in the cluster's DNS, and you can access it using simple names from any pod in the cluster.

## How Kubernetes DNS Works

### Basic Service Access (Same Namespace)
If services are in the same namespace, you can use just the service name:

```
<service-name>
```

**Example:**
```yaml
# mongodb-service in default namespace
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
```

From any pod in the same namespace, connect to:
```
mongodb-service:27017
```

### Cross-Namespace Access
For services in different namespaces, use:

```
<service-name>.<namespace>.svc.cluster.local
```

**Example:**
```
mongodb-service.default.svc.cluster.local:27017
```

### Fully Qualified Domain Name (FQDN)
The complete DNS name structure:
```
<service-name>.<namespace>.svc.<cluster-domain>
```

Default cluster domain is `cluster.local`, so:
```
mongodb-service.default.svc.cluster.local
```

## Practical Example

Let's say you have these services:

```yaml
# MongoDB Service
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
  namespace: database
spec:
  ports:
    - port: 27017
```

```yaml
# NestJS Backend Service
apiVersion: v1
kind: Service
metadata:
  name: backend-api
  namespace: default
spec:
  ports:
    - port: 5001
```

### Connection Examples

**From a pod in the `default` namespace:**
- Access MongoDB: `mongodb-service.database.svc.cluster.local:27017`
- Access backend: `backend-api:5001` (same namespace, short name works)

**From a pod in the `database` namespace:**
- Access MongoDB: `mongodb-service:27017` (same namespace)
- Access backend: `backend-api.default.svc.cluster.local:5001`

## Current Setup

With the `mongodb-service`, any pod in the cluster can connect using:

**Same namespace (default):**
```
mongodb://admin:Admin1!@mongodb-service:27017
```

**From different namespace:**
```
mongodb://admin:Admin1!@mongodb-service.default:27017
```

**Full FQDN:**
```
mongodb://admin:Admin1!@mongodb-service.default.svc.cluster.local:27017
```

This DNS resolution happens automatically - no configuration needed! It's one of the great features of Kubernetes that makes microservices communication seamless.

