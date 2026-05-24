const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

before(async function () {
  mongod = await MongoMemoryServer.create();
  process.env.url_Mongodb = mongod.getUri();
});

beforeEach(async function () {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }
});

after(async function () {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
