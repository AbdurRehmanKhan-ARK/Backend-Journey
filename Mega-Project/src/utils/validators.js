// validators.js
// Collection of reusable field-validation functions used across controllers.
// Keeping these separate from controllers keeps registerUser/loginUser etc.
// focused on business logic, not repetitive regex/format checks.

// Checks for a standard email format: something@something.something
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Username: only lowercase letters, numbers, underscores, dots — 3 to 20 chars
// (common pattern for platforms like Instagram/YouTube handles)
const isValidUsername = (username) => {
    const usernameRegex = /^[a-z0-9_.]{3,20}$/;
    return usernameRegex.test(username);
};

// Password strength: at least 8 chars, one uppercase, one lowercase,
// one number, one special character
const isStrongPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Fullname: just checks it's not empty after trimming, and has a reasonable length
const isValidFullname = (fullname) => {
    return fullname && fullname.trim().length >= 3 && fullname.trim().length <= 50;
};

export {
    isValidEmail,
    isValidUsername,
    isStrongPassword,
    isValidFullname,
};