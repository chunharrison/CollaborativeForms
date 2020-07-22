const express = require("express");
const router = express.Router();

const nodemailer = require('nodemailer');

const validateMessageInput = require("../../validation/messageValidation")
const validateBugReportInput = require("../../validation/bugReportValidation")

router.post('/send-message', (req, res) => {
    console.log('/send-message')

    // validation 
    const { errors, isValid } = validateMessageInput(req.body)
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const {email, subject, message} = req.body
    console.log('/send-message', email, subject, message)
    console.log(process.env.CONTACT_EMAIL_ADDRESS, process.env.MAILER_PASSWORD)

    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        auth: {
            user: process.env.MAILER_ADDRESS,
            pass: process.env.MAILER_PASSWORD
        }
    });

    var mailOptions = {
        from: email,
        to: process.env.CONTACT_EMAIL_ADDRESS,
        subject: subject,
        html: `<div> 
                    <p>${message}</p>
                    <p>from: ${email}</p>
                </div>`
    };

    smtpTransport.sendMail(mailOptions,
        (error, response) => {
            if (error) {
                res.send(error)
            } else {
                res.send('Success')
            }
                smtpTransport.close();
        });
})

router.post('/bug-report', (req, res) => {

    // validation 
    const { errors, isValid } = validateBugReportInput(req.body)
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const {emailBug, subjectBug, messageBug} = req.body
    console.log('/bug-report', emailBug, subjectBug, messageBug)
    console.log(process.env.CONTACT_EMAIL_ADDRESS, process.env.MAILER_PASSWORD)

    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        auth: {
            user: process.env.MAILER_ADDRESS,
            pass: process.env.MAILER_PASSWORD
        }
    });

    var mailOptions = {
        from: emailBug,
        to: process.env.BUG_REPORT_EMAIL_ADDRESS,
        subject: subjectBug,
        html: `<div> 
                    <p>${messageBug}</p>
                    <p>from: ${emailBug}</p>
                </div>`
    };

    smtpTransport.sendMail(mailOptions,
        (error, response) => {
            if (error) {
                res.send(error)
            } else {
                res.send('Success')
            }
                smtpTransport.close();
        });
})

module.exports = router;