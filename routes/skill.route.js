const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skill.controller");
const { requireAuth, requireRole } = require("../middlewares/roleMiddleware");

router.get("/", skillController.getSkills);
router.post("/", requireAuth, requireRole("admin"), skillController.createSkill);
router.delete("/:id", requireAuth, requireRole("admin"), skillController.deleteSkill);

module.exports = router;
