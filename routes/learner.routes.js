const express = require("express");
const router = express.Router();
const learnerController = require("../controllers/learner.controller");

router.post("/", learnerController.createLearner);
router.get("/", learnerController.getAllLearners);
router.get("/:id", learnerController.getLearnerById);
router.put("/:id", learnerController.updateLearner);
router.delete("/:id", learnerController.deleteLearner);

module.exports = router;