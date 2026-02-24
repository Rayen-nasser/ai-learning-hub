const express = require("express");
const router = express.Router();
const inscriptionController = require("../controllers/inscription.controller");

router.post("/", inscriptionController.createInscription);
router.get("/", inscriptionController.getAllInscriptions);
router.get("/:id", inscriptionController.getInscriptionById);
router.delete("/:id", inscriptionController.deleteInscription);

router.patch("/:id/payer", inscriptionController.payerInscription);
router.patch("/:id/annuler", inscriptionController.annulerInscription);
router.patch("/:id/progression", inscriptionController.mettreAJourProgression);
router.patch("/:id/complete", inscriptionController.marquerCoursComplete);

module.exports = router;