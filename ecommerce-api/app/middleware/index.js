const { authenticate, requireAdmin } = require("./auth.middleware.js");
// const { authenticate } = require("./auth.middleware.js");
const uploadMultipleImages = require("./upload.middleware.js");


module.exports = {
    authenticate,
    requireAdmin,
    uploadMultipleImages
}
