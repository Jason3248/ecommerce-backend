const { ValidationError } = require("../lib/errors");

const validateBody = (schema) => (req, res, next) =>
{
    const result = schema.safeParse(req.body);
    if (!result.success)
    {
        const details = result.error.issues.map((issue) =>
        {
            const field = issue.path.length ? issue.path.join(".") : "(body)";
            return `${field}: ${issue.message}`;
        });
        return next(new ValidationError("Request validation failed", details));
    }
    req.body = result.data;
    next();
};

module.exports = { validateBody };