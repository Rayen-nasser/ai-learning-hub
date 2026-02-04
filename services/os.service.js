 const os = require("os");

function getOsInfo() {
	return {
		hostname: os.hostname(),
		platform: os.platform(),
		architecture: os.arch(),
	};
}

module.exports = { getOsInfo };

 