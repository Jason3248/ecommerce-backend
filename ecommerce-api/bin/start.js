
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// const logger = require("../app/configs/logger");

// logger.info("Application startup initiated", {
//     environment: process.env.NODE_ENV ?? "development"
// });

require("../app/server").start();