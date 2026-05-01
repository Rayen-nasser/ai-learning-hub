const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const inscriptionModel = require("./models/inscription.model");
const formationModel = require("./models/formation.model");
const centreFormationModel = require("./models/centreFormation.model");

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Nasser:Rayennazertya@cluster0.zox2e.mongodb.net/database_2026?retryWrites=true&w=majority").then(async () => {
  try {
    console.log("Connected to MongoDB.");
    
    // Find a responsableCF
    const users = await mongoose.model("User", new mongoose.Schema({}, { strict: false })).find({ role: "responsableCF" });
    if (users.length === 0) {
      console.log("No responsableCF found.");
      process.exit();
    }
    
    const req = { user: { _id: users[0]._id } };
    console.log("Testing with Responsable:", req.user._id);
    
    const centres = await centreFormationModel.find({ responsableId: req.user._id }).select("_id");
    const centreIds = centres.map(c => c._id);
    console.log("centreIds:", centreIds);
    
    const formations = await formationModel.find({ centreId: { $in: centreIds } }).select("_id");
    console.log("formations length:", formations.length);
    
    const allFormations = await formationModel.find({});
    console.log("All formations length:", allFormations.length);
    
    const formationIds = formations.map(f => f._id);
    console.log("formationIds:", formationIds);
    
    const inscriptions = await inscriptionModel.find({ formationId: { $in: formationIds } });
    console.log("inscriptions length:", inscriptions.length);
    
    const allInscriptions = await inscriptionModel.find({});
    console.log("all inscriptions length:", allInscriptions.length);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
});
