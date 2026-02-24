const express = require("express");
const router = express.Router();
const leconController = require("../controllers/lecon.controller");

router.post("/", leconController.createLecon);
router.get("/", leconController.getAllLecons);
router.get("/:id", leconController.getLeconById);
router.put("/:id", leconController.updateLecon);
router.delete("/:id", leconController.deleteLecon);

module.exports = router;