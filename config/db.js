
const mongoose = require('mongoose');

module.exports.connectToMongodb = async () => {
  mongoose.connect(process.env.Url_Mongodb).then(() => {
    console.log('Connected to Mongodb');
  }).catch((err) => {
    console.error('Error connecting to Mongodb:', err);
  });
};