
var express = require('express');
var router = express.Router();
const os = require('os');
const osController = require('../controllers/os.controller');
/* GET home page. */
router.get('/os', function(req, res, next) {
  res.json('Operating Systems route');
});

router.get('/getOs', osController.getOsInfo);

// router.get("/getOs", (req, res, next) => {
//   try {
//     // Your logic here
//     const osInformations = {}; // Placeholder for actual data processing
//     osInformations.hostname = os.hostname();
//     osInformations.platform = os.platform();
//     osInformations.architecture = os.arch();

//     if (!osInformations) {
//       throw new Error("No OS information found");
//     }

//     res.status(200).json({ message: "OS root route" , data: osInformations });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
