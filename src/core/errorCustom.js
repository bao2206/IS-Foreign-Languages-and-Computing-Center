const reasonStatus = require('./reasonPhrases')
const statusCode = require('./statusCode')

class ErrorCustom extends Error {
    constructor(message , status) {
        super(message)
        this.status = status
    }
}


class BadRequestError extends ErrorCustom {
    constructor(message = reasonStatus.BAD_REQUEST, status = statusCode.BAD_REQUEST) {
        super(message, status)
       
    }
}

class UnAuthorizedError extends ErrorCustom {
    constructor(message = reasonStatus.UNAUTHORIZED, status = statusCode.UNAUTHORIZED) {
        super(message, status)
    }
}
class NotFoundError extends ErrorCustom {
    constructor(message = reasonStatus.NOT_FOUND, status = statusCode.NOT_FOUND) {
        super(message, status)
    }
}

class ForbiddenError extends ErrorCustom {
    constructor(message = reasonStatus.FORBIDDEN, status = statusCode.FORBIDDEN) {
        super(message, status)
    }
}
class NotAcceptableError extends ErrorCustom {
    constructor(message = reasonStatus.NOT_ACCEPTABLE, status = statusCode.NOT_ACCEPTABLE) {
        super(message, status)
    }
}
module.exports = {
    ErrorCustom,
    BadRequestError,
    UnAuthorizedError,
    NotFoundError,
    ForbiddenError,
    NotAcceptableError
}
