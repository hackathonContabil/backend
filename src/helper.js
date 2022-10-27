// Data helpers
function normalizeEmail(email) {
    return email.toLowerCase();
}

function removeSpecialCharacters(value) {
    return value.replace(/[^\w\s]/gi, '');
}

// Data masks helpers
function applyHideDocumentDataMask(document) {
    const formattedDocument = document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return applyHideDataMask(formattedDocument, [0, 1, 12, 13]);
}

function applyHideDataMask(plainText, positionsToKeep) {
    const maskedValue = plainText.split('');
    maskedValue.forEach((_, i) => {
        if (!positionsToKeep.includes(i)) {
            maskedValue[i] = '*';
        }
    });
    return maskedValue.join('');
}

module.exports = {
    // Data helpers
    normalizeEmail,
    removeSpecialCharacters,
    // Data masks helpers
    applyHideDataMask,
    applyHideDocumentDataMask,
};
