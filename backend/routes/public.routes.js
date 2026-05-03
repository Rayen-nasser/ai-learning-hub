const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public.controller");

router.get("/stats", publicController.getPublicStats);

module.exports = router;
