const express = require("express");
const router = express.Router();
const formateurController = require("../controllers/formateur.controller");

router.post("/", formateurController.createFormateur);
router.get("/", formateurController.getAllFormateurs);
router.get("/:id", formateurController.getFormateurById);
router.put("/:id", formateurController.updateFormateur);
router.delete("/:id", formateurController.deleteFormateur);

module.exports = router;