# Mongo

## _id field

You don't need to define _id as a prop because it already exists in the Document class. Queries performed against your MusicSupervisorModel will return an object of MusicSupervisorDocument. In case you want to add a field of ObjectId type to your schema you have to do it as follows to preserve casting to ObjectId:

```
import { Document, SchemaTypes, Types } from 'mongoose';

...

@Prop({ type: SchemaTypes.ObjectId })
yourField: Types.ObjectId
```
