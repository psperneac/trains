// mongodb://admin:Admin1!@localhost:27017/admin?ssl=false&directConnection=true&readPreference=primary&authMechanism=DEFAULT
// mongodb://trains:trains1!@localhost:27017/trains?ssl=false&directConnection=true&readPreference=primary&authMechanism=DEFAULT

// create trains database and collections
trains=db.getSiblingDB('trains');
trains.createUser({
  user:  'trains',
  pwd: 'trains1!',
  roles: [{
    role: 'readWrite',
    db: 'trains'
  }]
});
trains.createCollection('users');
trains.createCollection('places');
trains.createCollection('posts');
trains.createCollection('translations');
