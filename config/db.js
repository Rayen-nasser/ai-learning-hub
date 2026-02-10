const mongoose = require('mongoose');
 
module.exports.connectToDatabase = async () => {
    mongoose.connect(process.env.url_Mongodb).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
}
