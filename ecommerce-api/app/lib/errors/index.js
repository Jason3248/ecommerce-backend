const AppError = require("./AppError");


class ValidationError extends AppError
{
    constructor(message = 'Request Validation Error')
    {
        super(message, 400, 'VALIDATION_ERROR')
    }
}


class NotFoundError extends AppError
{
    constructor(message = 'Requested Resource not found')
    {
        super(message, 404, 'NOT_FOUND')
    }
}

class ConflictError extends AppError
{
    constructor(message = 'Resource conflict')
    {
        super(message, 409, 'CONFLICT')
    }
}

class UnauthorizedError extends AppError
{
    constructor(message = 'Authentication required')
    {
        super(message, 401, 'UNAUTHORIZED')
    }
}

class ForbiddenError extends AppError
{
    constructor(message = 'You do not have the permission to perform this action')
    {
        super(message, 403, 'FORBIDDEN')
    }
}

class BusinessRuleError extends AppError
{
    constructor(message = 'Business rule violated')
    {
        super(message, 422, 'BUSINESS_RULE_ERROR');
    }
}
class OutOfStockError extends AppError
{
    constructor(message = 'Requested product quantity is not available')
    {
        super(message, 409, 'OUT_OF_STOCK');
    }
}

class InvalidOrderStateError extends AppError
{
    constructor(message = 'Order is not in a valid state for this action')
    {
        super(message, 409, 'INVALID_ORDER_STATE');
    }
}

class PaymentError extends AppError
{
    constructor(message = 'Error while processing payment')
    {
        super(message, 402, 'PAYMENT_ERROR')
    }
}

module.exports = {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    BusinessRuleError,
    PaymentError,
    ConflictError,
    OutOfStockError,
    InvalidOrderStateError
}