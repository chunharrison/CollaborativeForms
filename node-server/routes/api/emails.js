const express = require("express");
const router = express.Router();

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const validateMessageInput = require("../../validation/messageValidation")
const validateBugReportInput = require("../../validation/bugReportValidation")

//Check to make sure header is not undefined, if so, return Forbidden (403)
const checkToken = (req, res, next) => {
    const header = req.headers['authorization'];
  
    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
  
        req.token = token;
        next();
    } else {
        //If header is undefined return Forbidden (403)
        res.sendStatus(403)
    }
  }

router.post('/send-message', (req, res) => {
    console.log('mailer');
    // validation 
    const { errors, isValid } = validateMessageInput(req.body)
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const {email, subject, message} = req.body

    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        auth: {
            user: process.env.MAILER_LOGIN,
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
    console.log('mailer 2')
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

router.post('/bug-report', checkToken, (req, res) => {

    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            // validation 
            const { errors, isValid } = validateBugReportInput(req.body)
            if (!isValid) {
                return res.status(400).json(errors);
            }

            const {emailBug, subjectBug, messageBug} = req.body

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
        }
    })
})

module.exports = router;