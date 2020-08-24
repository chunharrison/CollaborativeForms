const express = require("express");
const router = express.Router();
var cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const validateMessageInput = require("../../validation/messageValidation")
const validateBugReportInput = require("../../validation/bugReportValidation")

router.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
    "Access-Control-Allow-Origin": "http://localhost:3000",
}))

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

router.post('/send-verification-email', (req, res) => {
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        auth: {
            user: process.env.MAILER_LOGIN,
            pass: process.env.MAILER_PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.MAILER_LOGIN,
        to: req.body.email,
        subject: 'Cosign: Account Email Verification',
        html: `
        <!DOCTYPE html>
<html>

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 400;
                src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 700;
                src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 400;
                src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 700;
                src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
            }
        }

        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* MOBILE STYLES */
        @media screen and (max-width:600px) {
            h1 {
                font-size: 32px !important;
                line-height: 32px !important;
            }
        }

        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
            margin: 0 !important;
        }
    </style>
</head>

<body style="background-color: #ea9d9d; margin: 0 !important; padding: 0 !important;">
    <!-- HIDDEN PREHEADER TEXT --><div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- LOGO -->
            <tr>
                <td bgcolor="#ea9d9d" align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        <tr>
                            <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td bgcolor="#ea9d9d" align="center" style="padding: 0px 10px 0px 10px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        <tr>
                            <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome!</h1> <img src=" https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" align="left">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td align="center" style="border-radius: 3px;" bgcolor="#ea9d9d">
                                                    <a href=${process.env.REACT_APP_FRONTEND_ADDRESS}/verify/${req.body.key} target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #ea9d9d; display: inline-block;">Confirm Account</a></td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr> <!-- COPY -->
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                            </td>
                        </tr> <!-- COPY -->
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;"><a href=${process.env.REACT_APP_FRONTEND_ADDRESS}/verify/${req.body.key} target="_blank" style="color: #ea9d9d;">${process.env.REACT_APP_FRONTEND_ADDRESS}/verify/${req.body.key}</a></p>
                            </td>
                        </tr>
                        <tr>
                        <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td bgcolor="#ea9d9d" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #FFECD1; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                        <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
                                        <p style="margin: 0;">
                                        <a href=${process.env.REACT_APP_FRONTEND_ADDRESS}/contact-us target="_blank" style="color: #666666;">We&rsquo;re here to help you out</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    </table>
                </td>
            </tr>
        </table>
        </body>

</html>`


        //  `<div> 
        //         ${process.env.REACT_APP_FRONTEND_ADDRESS}/verify/${req.body.key}
        //         </div>`
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

router.post('/send-message', (req, res) => {
    // validation 
    const { errors, isValid } = validateMessageInput(req.body)
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.emailMessage;
    const subject = req.body.subjectMessage;
    const message = req.body.messageMessage;

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