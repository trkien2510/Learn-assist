// Cookie utility functions
const cookieUtils = {
    /**
     * Set a cookie
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Expiration in days (default: 7)
     */
    set(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    },

    /**
     * Get a cookie value
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null if not found
     */
    get(name) {
        const nameEQ = name + '=';
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    },

    /**
     * Remove a cookie
     * @param {string} name - Cookie name
     */
    remove(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    },

    /**
     * Check if cookie exists
     * @param {string} name - Cookie name
     * @returns {boolean}
     */
    has(name) {
        return this.get(name) !== null;
    }
};

export default cookieUtils;
