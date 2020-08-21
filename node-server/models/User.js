const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
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
  },
  provider: {
    type: String,
    default: 'Cosign'
  },
  googleId: {
    type: String,
    default: null
  },
  facebookId: {
    type: String,
    default: null
  },
  linkedinId: {
    type: String,
    default: null
  },
  customerId: {
    type: String,
    required: true
  },
  subscription: {
    type: Object,
    required: false,
  },
  product: {
    type: Object,
    required:true,
  },
  latestInvoice: {
    type: Object,
    required:false,
  },
  expire: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = User = mongoose.model("users", UserSchema);