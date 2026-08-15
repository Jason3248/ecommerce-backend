const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const loadRoutes = require("./configs/route-config.js");
const notFoundHandler = require("./middleware/notFound.middleware.js");
const errorHandler = require("./middleware/error.middleware.js");


const app = express();
// app.use(helmet());
app.use(cors());
app.use(express.json({
    verify: (req, res, buf) =>
    {
        // Store the raw buffer/string on the request object
        req.rawBody = buf.toString('utf8');
    }
}));
loadRoutes(app);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;