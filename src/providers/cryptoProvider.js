const { createCipheriv, createDecipheriv } = require('crypto');
const { hashSync, compareSync, genSaltSync } = require('bcryptjs');

module.exports = class {
    iv = process.env.CRYPTO_IV;
    algorithm = process.env.CRYPTO_ALGORITHM;
    secretKey = process.env.CRYPTO_SECRET_KEY;

    constructor() {
        const parsedSalt = Number(process.env.BCRYPT_SALT);
        this.bcryptSalt = genSaltSync(parsedSalt);
    }

    hash(plainText) {
        return hashSync(plainText, this.bcryptSalt);
    }

    compareHash(plainText, hash) {
        return compareSync(plainText, hash);
    }

    encrypt(plainText) {
        const cipher = createCipheriv(this.algorithm, this.secretKey, this.iv);
        const encrypted = cipher.update(plainText, 'utf8', 'base64');
        return encrypted + cipher.final('base64');
    }

    decrypt(encryptedText) {
        const decipher = createDecipheriv(this.algorithm, this.secretKey, this.iv);
        const decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        return decrypted + decipher.final('utf8');
    }
};
