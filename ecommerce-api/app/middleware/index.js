const authenticate = require("./authenticate.middleware.js");
const authorize = require("./authorize.middleware.js");
const uploadMultipleImages = require("./upload.middleware.js");
const validateBody = require("./validate.middleware.js");

module.exports = {
    authenticate,
    authorize,
    uploadMultipleImages,
    validateBody
}
