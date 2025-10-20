# Mongo

## Install and connect

```
brew tap mongodb/brew    
brew install mongodb-community 
brew services start mongodb/brew/mongodb-community 

vim /opt/homebrew/etc/mongod.conf 

## add this
security:
  authorization: "enabled"

# then
brew services restart mongodb/brew/mongodb-community 

mongosh -u admin -p Admin1! --authenticationDatabase admin
```

```
trains=db.getSiblingDB('trains');
trains.createUser({
  user:  'trains',
  pwd: 'trains1!',
  roles: [{
    role: 'readWrite',
    db: 'trains'
  }]
});
```

## _id field

You don't need to define _id as a prop because it already exists in the Document class. Queries performed against your MusicSupervisorModel will return an object of MusicSupervisorDocument. In case you want to add a field of ObjectId type to your schema you have to do it as follows to preserve casting to ObjectId:

```
import { Document, SchemaTypes, Types } from 'mongoose';

...

@Prop({ type: SchemaTypes.ObjectId })
yourField: Types.ObjectId
```
