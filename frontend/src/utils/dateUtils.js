/**
 * Format datetime-local input value to ISO string with timezone offset
 * @param {string} dateTimeStr - datetime-local input value (format: "2025-12-26T20:00")
 * @returns {string} ISO string with timezone offset (format: "2025-12-26T20:00:00+07:00")
 */
export const formatDateTimeWithOffset = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const offset = -date.getTimezoneOffset(); // Minutes
    const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const offsetMins = String(Math.abs(offset) % 60).padStart(2, '0');
    const offsetSign = offset >= 0 ? '+' : '-';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = '00';

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
};

/**
 * Format ISO datetime string to local datetime for datetime-local input
 * @param {string} isoString - ISO datetime string
 * @returns {string} Local datetime string (format: "2025-12-26T20:00")
 */
export const formatISOToLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Ensure datetime string has UTC timezone indicator
 * Workaround for backend returning naive datetime without Z suffix
 * @param {string} dateString - Datetime string from backend
 * @returns {string} Datetime string with Z suffix if it was missing
 */
export const ensureUTC = (dateString) => {
    if (!dateString) return dateString;
    // If datetime doesn't have timezone info (no Z or +/- offset), add Z
    if (!/Z|[+-]\d{2}:\d{2}$/.test(dateString)) {
        return dateString + 'Z';
    }
    return dateString;
};
