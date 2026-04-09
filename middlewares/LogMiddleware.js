const fs = require("fs");
const path = require("path");

function logMiddleware(req, res, next) {
  if (process.env.NODE_ENV === "production") {
    return next();
  }

  const startTime = new Date();
  appendLog(req, res, startTime);
  next();
}

function appendLog(req, res, startTime) {
  const headers = JSON.stringify(req.headers);
  const endTime = new Date();
  const executionTime = endTime - startTime;
  const body =
    Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "N/A";
  const referer = req.headers.referer || "N/A";
  const log = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - ${req.ip} - Referer: ${referer} - ${res.statusCode} - \nHeaders: ${headers}\nExecution Time: ${executionTime} ms\nBody: ${body}\n - ${res.locals.data}\n`;

  const logsDirectory = path.join(__dirname, "..", "logs");
  const logFilePath = path.join(logsDirectory, "doc.log");

  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
  }
  try {
    fs.appendFileSync(logFilePath, log);
  } catch (err) {
    console.error("Error writing log:", err);
  }
}
module.exports = logMiddleware;
