module.exports = class UnauthorizedError {
    status = 401;

    constructor(message) {
        this.message = message;
    }
};
