const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Paiement = require('../models/paiement.model');

async function checkIndex() {
  await mongoose.connect(process.env.url_Mongodb || 'mongodb://127.0.0.1:27017/test');
  console.log('Connected to DB');

  try {
    const indexes = await Paiement.collection.indexes();
    console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

    const nullRefs = await Paiement.countDocuments({ reference: null });
    console.log('Documents with reference: null ->', nullRefs);

    const undefinedRefs = await Paiement.countDocuments({ reference: { $exists: false } });
    console.log('Documents without reference field ->', undefinedRefs);

    await Paiement.collection.dropIndex('reference_1');
    console.log('Dropped index reference_1 successfully');
  } catch (err) {
    if (err.codeName === 'IndexNotFound' || err.code === 27) {
      console.log('Index reference_1 not found, nothing to drop');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    await mongoose.connection.close();
  }
}

checkIndex();
