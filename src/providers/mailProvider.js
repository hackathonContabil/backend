const { join } = require('path');
const { readFileSync } = require('fs');
const { createTransport } = require('nodemailer');
const { compile: compileTemplate } = require('handlebars');

module.exports = class {
    smtpHost = process.env.SMTP_HOST;
    smtpPort = process.env.SMTP_PORT;
    smtpUser = process.env.SMTP_USER;
    smtpPassword = process.env.SMTP_PASSWORD;
    mailDomain = process.env.MAIL_DOMAIN;
    apiRootUrl = process.env.API_ROOT_URL;

    constructor() {
        this.mailer = createTransport({
            host: this.smtpHost,
            port: this.smtpPort,
            auth: { user: this.smtpUser, pass: this.smtpPassword },
        });
    }

    getMailTemplate(template, templateData) {
        const mailTemplateDir = join(__dirname, '..', 'views', 'emails', `${template}.handlebars`);
        const mailTemplateFile = readFileSync(mailTemplateDir).toString();
        const mailTemplateCompiler = compileTemplate(mailTemplateFile, 'utf8');
        return mailTemplateCompiler(templateData);
    }

    send(templateName, templateData, subject, to) {
        const mail = this.getMailTemplate(templateName, templateData);
        this.mailer.sendMail({ html: mail, from: this.mailDomain, subject, to });
    }

    sendActivateAccountMail(token, userEmail) {
        const mailData = {
            link: `${this.apiRootUrl}/user/activate/${token}`,
        };

        const mailTemplate = 'activate-account';
        const mailSubject = 'E-mail para ativação de contas';
        this.send(mailTemplate, mailData, mailSubject, userEmail);
    }
};
