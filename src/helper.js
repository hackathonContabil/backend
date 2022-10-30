function formatDate(date) {
    const formattedDay = new Date(date).getDay();
    const formattedMonth = new Date(date).getMonth();
    const formattedYear = new Date(date).getFullYear();
    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
}

function normalizeName(name) {
    return name.toUpperCase();
}

function normalizeEmail(email) {
    return email.toLowerCase();
}

module.exports = { formatDate, normalizeName, normalizeEmail };
