class AppError extends Error
{
    constructor(message, statusCode, code)
    {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;

    }
}
module.exports = AppError;