const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateMessageInput(data) {
    let errors = {};
  
    // Convert empty fields to an empty string so we can use validator functions
    data.emailMessage = !isEmpty(data.emailMessage) ? data.emailMessage : "";
    data.subjectMessage = !isEmpty(data.subjectMessage) ? data.subjectMessage : "";
    data.messageMessage = !isEmpty(data.messageMessage) ? data.messageMessage : "";

    
    // Email (Message) checks
    if (Validator.isEmpty(data.emailMessage)) {
        errors.emailMessage = "Email field is required";
    } else if (!Validator.isEmail(data.emailMessage)) {
        errors.emailMessage = "Email is invalid";
    }
  
    // Subject (Message) checks
    if (Validator.isEmpty(data.subjectMessage)) {
        errors.subjectMessage = "Subject field is required";
    }

    // Message (Message) checks
    if (Validator.isEmpty(data.messageMessage)) {
        errors.messageMessage = "Message field is required";
    }

  
    return {
        errors,
        isValid: isEmpty(errors)
    };
};