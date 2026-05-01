const mongoose = require('mongoose');
const config = require('./config');

module.exports.connectToMongoDB = async () => {
  mongoose.connect(config.mongoUri).then(() => {
    console.log('Connected to Mongodb');
  }).catch((err) => {
    console.error('Error connecting to Mongodb:', err);
  });
};
