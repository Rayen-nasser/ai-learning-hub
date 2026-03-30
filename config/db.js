
const mongoose = require('mongoose');

module.exports.connectToMongoDB  = async () => {
  mongoose.connect(process.env.Url_Mongodb).then(() => {
    console.log('Connected to Mongodb');
  }).catch((err) => {
    console.error('Error connecting to Mongodb:', err);
  });
};