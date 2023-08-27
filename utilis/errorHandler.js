class ErrorHandler extends Error {
    constructor(message, errorCode ){
        super( message)
        this.statusCode = statusCode

        Error.captureStackTrace(this, this.constructor)
    }
}

export default  ErrorHandler;