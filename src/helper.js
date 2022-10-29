function normalizeName(name) {
    return name.toUpperCase();
}

function normalizeEmail(email) {
    return email.toLowerCase();
}

module.exports = { normalizeName, normalizeEmail };
