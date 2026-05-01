const mongoose = require("mongoose");
const formationModel = require("./models/formation.model");
const centreFormationModel = require("./models/centreFormation.model");

const req = { user: { _id: new mongoose.Types.ObjectId() } };

// simulate the query in inscription.controller.js
const centreIds = []; // Empty array like when they don't have centres
const q = formationModel.find({ centreId: { $in: centreIds } }).select("_id");

console.log("Query when centreIds is empty:", q.getQuery());

// simulate what it was BEFORE my fix!
const oldQuery = formationModel.find({ 'centreId.responsableId': req.user._id }).select("_id");
console.log("Old Query:", oldQuery.getQuery());

