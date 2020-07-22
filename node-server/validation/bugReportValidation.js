const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateBugReportInput(data) {
    let errors = {};
  
    // Convert empty fields to an empty string so we can use validator functions
    data.emailBug = !isEmpty(data.emailBug) ? data.emailBug : "";
    data.subjectBug = !isEmpty(data.subjectBug) ? data.subjectBug : "";
    data.messageBug = !isEmpty(data.messageBug) ? data.messageBug : "";


     // Email (Bug) checks
     if (Validator.isEmpty(data.emailBug)) {
        errors.emailBug = "Email field is required";
    } else if (!Validator.isEmail(data.emailBug)) {
        errors.emailBug = "Email is invalid";
    }
  
    // Subject (Bug) checks
    if (Validator.isEmpty(data.subjectBug)) {
        errors.subjectBug = "Subject field is required";
    }

    // Message (Bug) checks
    if (Validator.isEmpty(data.messageBug)) {
        errors.messageBug = "Message field is required";
    }

  
    return {
        errors,
        isValid: isEmpty(errors)
    };
};