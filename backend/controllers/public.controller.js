const userModel = require("../models/user.model");
const avisModel = require("../models/avis.model");
const formationModel = require("../models/formation.model");
const categorieModel = require("../models/categorie.model");
const inscriptionModel = require("../models/inscription.model");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("express-async-handler");

module.exports.getPublicStats = asyncHandler(async (req, res) => {
  const studentsCount = await userModel.countDocuments({ role: 'apprenant', block: false });
  const formationsCount = await formationModel.countDocuments();
  const categoriesCount = await categorieModel.countDocuments();
  
  // Calculate average satisfaction based on reviews
  const reviews = await avisModel.find();
  let satisfaction = 0;
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((acc, rev) => acc + rev.note || rev.rating || 5, 0);
    const avg = totalRating / reviews.length;
    // Map rating to percentage
    satisfaction = Math.round((avg / 5) * 100);
  } else {
    satisfaction = 98; // Fallback default
  }

  const enrollmentsCount = await inscriptionModel.countDocuments({ statut: 'approuvé' });

  // Format the numbers for the frontend
  // Only use K+ if count is over 1000, otherwise show exact number
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'K+';
    }
    return num.toString();
  };

  return sendSuccess(res, {
    students: formatNumber(studentsCount),
    formations: formatNumber(formationsCount),
    categories: formatNumber(categoriesCount),
    satisfaction: satisfaction + '%',
    enrollments: formatNumber(enrollmentsCount)
  }, "Public stats retrieved successfully");
});
