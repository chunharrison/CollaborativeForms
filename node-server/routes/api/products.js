const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var cors = require('cors');
const bodyParser = require('body-parser');

//stripe api
const stripe = require('stripe')(`${process.env.STRIPE_API_KEY}`);

// Load User model
const Product = require("../../models/Product");
const User = require("../../models/User");
const { ReplSet } = require("mongodb");

router.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
  "Access-Control-Allow-Origin": "http://localhost:3000",
}))

router.get('/retrieve-products', async (req,res) => {
  Product.find({}).then(products => {
    res.send(products);
  })
  .catch(error =>
    res.send(error)
  )
})

router.get('/retrieve-user-product', async (req,res) => {
    const customerId = req.query.customerId;
    User.findOne({ customerId: customerId }).then(user => {
      res.send(user.product);
    })
    .catch(error =>
      res.send(error)
    )
})  

module.exports = router;