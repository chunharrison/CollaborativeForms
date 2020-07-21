require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_LOGIN,
    pass: process.env.MAILER_PASSWORD
  }
})

const getPasswordResetURL = (user, token) =>
  `http://localhost:3000/reset/${user._id}/${token}`

const resetPasswordTemplate = (user, url) => {
  const from = process.env.MAILER_LOGIN
  const to = user.email
  const subject = "Password Reset"
  const html = `
  <p>Hey ${user.displayName || user.email},</p>
  <p>We heard that you lost your password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>–Your friends at Cosign</p>
  `

  return { from, to, subject, html }
}

module.exports = { transporter, getPasswordResetURL, resetPasswordTemplate };