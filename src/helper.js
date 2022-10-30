function formatDate(date) {
    const formattedDay = new Date(date).getUTCDate();
    const formattedMonth = new Date(date).getUTCMonth() + 1;
    const formattedYear = new Date(date).getFullYear();
    return `${formattedDay < 10 ? `0${formattedDay}` : formattedDay}/${
        formattedMonth < 10 ? `0${formattedMonth}` : formattedMonth
    }/${formattedYear}`;
}

function formatNumber(number) {
    return number.toString().replace('.', ',');
}

function normalizeName(name) {
    return name.toUpperCase();
}

function normalizeEmail(email) {
    return email.toLowerCase();
}

module.exports = { formatDate, formatNumber, normalizeName, normalizeEmail };
