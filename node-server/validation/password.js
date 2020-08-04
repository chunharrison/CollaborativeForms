const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validatePasswordInput(data) {
    let errors = {};
    // Convert empty fields to an empty string so we can use validator functions
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 : "";
    // Password checks
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required";
    }

    if (Validator.isEmpty(data.password2)) {
        errors.password2 = "Confirm password field is required";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};