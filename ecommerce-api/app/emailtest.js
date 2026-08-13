const EmailService = require("./lib/mail/EmailService.js");

const emailService = new EmailService();

emailService.verifyConnection()
    .then(() =>
    {
        console.log("Gmail SMTP connection successful");
    })
    .catch((error) =>
    {
        console.error("Gmail SMTP connection failed:", error);
    });