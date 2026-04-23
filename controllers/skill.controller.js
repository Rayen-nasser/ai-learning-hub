const skillModel = require("../models/skill.model");
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/response");

// @desc    Get all skills
// @route   GET /skills
// @access  Public
module.exports.getSkills = asyncHandler(async (req, res) => {
  const skills = await skillModel.find().sort({ name: 1 });
  return sendSuccess(res, skills, "Skills retrieved successfully");
});

// @desc    Create a skill
// @route   POST /skills
// @access  Private (Admin)
module.exports.createSkill = asyncHandler(async (req, res) => {
  const { name, category, description } = req.body;

  if (!name) {
    return sendError(res, "Skill name is required", 400);
  }

  const existingSkill = await skillModel.findOne({ name: name.trim() });
  if (existingSkill) {
    return sendError(res, "Skill already exists", 400);
  }

  const skill = await skillModel.create({ name, category, description });
  return sendSuccess(res, skill, "Skill created successfully", 201);
});

// @desc    Delete a skill
// @route   DELETE /skills/:id
// @access  Private (Admin)
module.exports.deleteSkill = asyncHandler(async (req, res) => {
  const skill = await skillModel.findByIdAndDelete(req.params.id);
  if (!skill) {
    return sendError(res, "Skill not found", 404);
  }
  return sendSuccess(res, null, "Skill deleted successfully");
});
