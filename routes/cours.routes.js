const express = require("express");
const router = express.Router();
const coursController = require("../controllers/cours.controller");

router.post("/", coursController.createCours);
router.get("/", coursController.getAllCours);
router.get("/:id", coursController.getCoursById);
router.put("/:id", coursController.updateCours);
router.delete("/:id", coursController.deleteCours);

router.patch("/:id/publier", coursController.publierCours);
router.patch("/:id/depublier", coursController.depublierCours);

router.post("/:id/lecons", coursController.ajouterLecon);

module.exports = router;