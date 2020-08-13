const mongoose = require("mongoose")
const Schema = mongoose.Schema

const EmailVerificationSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = EmailVerification = mongoose.model("verifications", EmailVerificationSchema)