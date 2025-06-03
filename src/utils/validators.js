/**
 * Utility functions for validating user input fields
 */

// Vietnamese phone number regex
// Format: +84 or 0 followed by 3, 5, 7, 8, or 9 and 8 digits
const VIETNAMESE_PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

// Vietnamese citizen ID regex (12 digits)
const CITIZEN_ID_REGEX = /^\d{12}$/;

// Standard email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates a Vietnamese phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidVietnamesePhone = (phone) => {
    if (!phone) return true; // Skip validation if not provided
    return VIETNAMESE_PHONE_REGEX.test(phone);
};

/**
 * Validates a Vietnamese citizen ID
 * @param {string} citizenId - The citizen ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidCitizenId = (citizenId) => {
    if (!citizenId) return true; // Skip validation if not provided
    return CITIZEN_ID_REGEX.test(citizenId);
};

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
    if (!email) return true; // Skip validation if not provided
    return EMAIL_REGEX.test(email);
};

/**
 * Validates all fields at once
 * @param {Object} data - Object containing fields to validate
 * @param {string} [data.phone] - Phone number
 * @param {string} [data.citizenId] - Citizen ID
 * @param {string} [data.email] - Email address
 * @returns {Object} - Object containing validation results and error messages
 */
const validateFields = (data) => {
    const errors = {};
    
    if (data.phone && !isValidVietnamesePhone(data.phone)) {
        errors.phone = 'Invalid Vietnamese phone number format. Must start with +84 or 0 followed by 3, 5, 7, 8, or 9 and 8 digits';
    }
    
    if (data.citizenId && !isValidCitizenId(data.citizenId)) {
        errors.citizenId = 'Invalid citizen ID. Must be exactly 12 digits';
    }
    
    if (data.email && !isValidEmail(data.email)) {
        errors.email = 'Invalid email format';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

module.exports = {
    isValidVietnamesePhone,
    isValidCitizenId,
    isValidEmail,
    validateFields
}; 