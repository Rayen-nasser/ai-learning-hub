const os = require('os');
module.exports.getOsInfo = (req, res) => {
  try {
    const osInformations = {
      platform: os.platform(),
      architecture: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      hostname: os.hostname(),
      uptime: os.uptime()
    };
    res.status(200).json({
      message: "OS Information retrieved successfully",
      data: osInformations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};