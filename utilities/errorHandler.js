module.exports = class extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.operationalError = true;

        Error.captureStackTrace(this, this.constructor);
    }
}