const multer = require("multer");
const { validationError, ValidationError } = require("../lib/errors");
const { log } = require("winston");

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_FILE_COUNT = 5;

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) =>
    {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
        {
            return cb(
                new ValidationError(
                    `Unsupported image type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
                )
            );
        }
        cb(null, true);
    },
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: MAX_FILE_COUNT
    }
}).array('images', MAX_FILE_COUNT);


const uploadMultipleImages = (req, res, next) =>
{
    upload(req, res, (err) =>
    {
        if (err instanceof multer.MulterError)
        {
            if (err.code === 'LIMIT_UNEXPECTED_FILE')
            {
                if (err.field && err.field !== 'images')
                {
                    return next(new ValidationError(
                        `Unexpected field "${err.field}" — files must be sent under the field name "images".`
                    ));
                }
                return next(new ValidationError(`Too many files. Maximum allowed is ${MAX_FILE_COUNT}.`));
            }
            if (err.code === 'LIMIT_FILE_SIZE')
            {
                return next(new ValidationError(
                    `One or more files exceed the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit.`
                ));
            }
            return next(new ValidationError(`Image upload error: ${err.message}`));
        }
        if (err) return next(err);
        if (!req.files || req.files.length === 0)
        {
            return next(new ValidationError('No images provided'));
        }
        next();
    });
};

module.exports = uploadMultipleImages;
