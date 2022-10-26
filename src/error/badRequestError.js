module.exports = class BadRequestError {
    status = 400;

    constructor(message) {
        this.message = message;
    }
};
