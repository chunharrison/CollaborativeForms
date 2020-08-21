const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ProductSchema = new Schema({
  productName: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  priceId: {
    type: String,
    required: true,
  },
  docCount : {
    type: Number,
    required: true,
  },
  guestCount : {
    type: Number,
    required: true,
  },
  
});
module.exports = Product = mongoose.model("products", ProductSchema);