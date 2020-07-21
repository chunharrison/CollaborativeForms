const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");

const { transporter, getPasswordResetURL, resetPasswordTemplate } = require('./modules/email');


const usePasswordHashToMakeToken = ({
  password,
  _id: userId,
  date
}) => {
  // highlight-start
  const secret = password + "-" + date;
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600 // 1 hour
  })
  // highlight-end
  return token;
}

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
    // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  const email = req.body.email;
    const password = req.body.password;
  // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          };
          // Sign token
          jwt.sign(
            payload,
            process.env.JWT_PRIVATE_KEY,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
  });
});

router.get("/forgot-password", async (req, res) => {
  const { email } = req.query;
  let user = await User.findOne({ email }).exec();
  if (user === null) {
    return res.status(404).json("No user with that email exists");
  }
  const token = usePasswordHashToMakeToken(user);
  const url = getPasswordResetURL(user, token);
  const emailTemplate = resetPasswordTemplate(user, url);
  const sendEmail = (res) => {
      transporter.sendMail(emailTemplate, (err, info) => {
          if (err) {
          res.status(500).json("Error sending email")
          }
          console.log(`** Email sent **`, info.response)
          res.status(200);
          res.send();
      })
  }
  sendEmail(res);
});

router.post("/new-password", (req, res) => {
  const { userId, token, password } = req.body
  // highlight-start
  User.findOne({ _id: userId }).then(user => {
      const secret = user.password + "-" + user.createdAt
      const payload = jwt.decode(token, secret)
      if (payload.userId === user.id) {
          bcrypt.genSalt(10, function(err, salt) {
              // Call error-handling middleware:
              if (err) return;
              bcrypt.hash(password, salt, function(err, hash) {
              // Call error-handling middleware:
              if (err) return;
              User.findOneAndUpdate({ _id: userId }, { password: hash })
                  .then(() => res.status(202).json("Password changed accepted"))
                  .catch(err => res.status(500).json(err))
              })
          })
      }
    })
    // highlight-end
    .catch(() => {
    res.status(404).json("Invalid user")
  })
});

module.exports = router;