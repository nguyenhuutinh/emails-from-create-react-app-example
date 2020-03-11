"use strict";
var path = require("path");
var templatesDir = path.resolve(__dirname, "views/mailer");
var Email = require("email-templates");

const mailjet = require("node-mailjet").connect(
  "d02fb312f07bfb40cb670a33d3405050",
  "c62fffe7fdf7f0a413754612ac59429b"
);

const sendEmail = (messageInfo, text, html) => {
  return mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: { Email: messageInfo.fromEmail, Name: messageInfo.fromName },
        To: [{ Email: "tn@ipification.com" }],
        Subject: messageInfo.subject,
        TextPart: text,
        HTMLPart: html
      }
    ]
  });
};

exports.sendOne = function(templateName, messageInfo, locals) {
  const email = new Email({
    views: { root: templatesDir, options: { extension: "ejs" } }
  });

  return Promise.all([
    email.render(`${templateName}/html`, locals),
    email.render(`${templateName}/text`, locals)
  ])
    .then(([html, text]) => {
      return sendEmail(messageInfo, text, html);
    })
    .catch(console.error);
};
