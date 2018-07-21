/* eslint-disable no-console */ // TODO: Remove console.log after DEBUG is done.

const path = require('path');
var crypto = require('crypto');
var juice = require('juice');

const pug = require('pug');
const ext = 'pug';
const eng = pug;

module.exports = function(app) {

  const logo = path.join(app.get('public'), app.get('logo')) || '';
  const supportEmail = app.get('email_support') || '';  // Support address to include for transaction emails
  const fromEmail = app.get('email_from_auth') || '';  // "From" address for transaction emails
  const replyEmail = // "Response" address for transaction emails
    // Choose one of the options: TODO: Implement config parameter for transaction emails
    // fromEmail
    supportEmail
    // '' // empty field TODO: check if it produces output 'Reply-To' header.. No "Reply-To" in header.
    // '"" : ' // special string, provides empty list of emails using group notation. Shows up as "Reply-To: undefined:;"
    //TODO: check how clients fill in reply & reply-all addresses: Gmail: ?, Yahoo: from/from, Hotmail: ?, Outlook: ?.
  ;
  const emailAccountTemplatesPath = path.join(app.get('src'), 'email-templates', 'account');

  /**
   * Format URL for action link
   * @param {string} type 
   * @param {string} token 
   * @returns {string}
   */
  function getLink(type, token) {
    //?var url;
    var protocol = (app.get('protocol') || 'http') + '://';
    var host = app.get('host') || 'localhost';
    var port = ':' + app.get('port');
    return `${protocol}${host}${port}/#!/${type}/${token}`;
  }

  /**
   * Generate md5 hash for given value
   * @param {string} value 
   * @returns {string}
   */
  function getHash(value) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(value.toString());
    return md5sum.digest('hex');
  }

  /**
   * Format attachment object for given file
   * @param {string} cyd
   * @param {string} filepath
   * @param {striing} disposition
   * @returns {Object}
   */
  function formatAttachment(cid, filepath, disposition = 'inline') {
    let attachment = {
      filename: path.basename(filepath),
      path: filepath,
      encoding: 'base64',
      cid: cid.toString(),
      contentDisposition: disposition,
    };
    return attachment;
  }

  function sendEmail(email) {
    return app.service('emails').create(email).then(function (result) {
      console.log('Sent email', result);
    }).catch(err => {
      console.log('Error sending email', err);
    });
  }

  return {
    /**
     * @param {string} type
     * @param {User} user
     * @param {Object} notifierOptions
     * @returns {Promise}
     */
    // eslint-disable-next-line no-unused-vars
    notifier: function(type, user, notifierOptions) {
      console.log(`-- Preparing ${type} email to ${user.email}`);
      const userName = user.name || user.email; // TODO: Implement user.name
      var subject, template, hash, hashLink, changes;
      
      // Insert attachment inline images (URL-based data is blocked by certain clients, e.g. Gmail)
      const cidLogo = getHash('logo@cid');
      var attachments = [formatAttachment(cidLogo, logo)];

      switch (type) {
      case 'resendVerifySignup': // From resendVerifySignup API call: send another email with link for verifying user's email addr
        subject = 'Confirm Signup';
        template = 'verify-email';
        hash = user.verifyToken;
        hashLink = getLink('verify-account', hash);
        break;

      case 'verifySignup': // From verifySignupLong and verifySignupShort API calls: inform that user's email is now confirmed
        subject = 'Thank you, your email has been verified';
        template = 'email-verified';
        hash = user.verifyToken;
        hashLink = getLink('verify-account', hash);
        break;

      case 'sendResetPwd': // From sendResetPwd API call: send email with password reset link and token
        subject = 'Reset Password';
        template = 'reset-password';
        hash = user.resetToken;
        hashLink = getLink('reset-password', hash);
        break;

      case 'resetPwd': // From resetPwdLong and resetPwdShort API calls: inform that user's password was reset
        subject = 'Your password was reset';
        template = 'password-was-reset';
        //hash = user.resetToken; // TODO: is hash & hashLink needed here? Should not be. Checked: template does not have link to use it.
        //hashLink = getLink('reset-password', hash);
        break;

      case 'passwordChange': // From passwordChange API call
        subject = 'Your password was changed';
        template = 'password-change'; // TODO: There should be no difference between 'password-was-reset' (via reset link) and 'password-change' (via app/API)
        break;

      case 'identityChange': // From identityChange API call
        subject = 'Your account was changed. Please verify the changes';
        template = 'identity-change';
        hash = user.verifyToken; // TODO; is hash & hashLink needed here? Should not be. Verified - there are links in template. Where do they send the user?
        hashLink = getLink('verify-account-changes', hash);
        changes = user.verifyChanges;
        break;

      default:
        return Promise.reject(new Error(`Unknown command ${type}`));
      }

      let templatePath = path.join(emailAccountTemplatesPath, template + '.' + ext);
      let fields = {
        logo: 'cid:' + cidLogo,
        from: fromEmail,
        name: userName,
        supportEmail, // For support email link
        hash,
        hashLink,
        changes
      };
      // if (hashLink) fields.hashLink = hashLink;
      // if (changes) fields.changes = changes;
      let compiledHTML = eng.compileFile(templatePath)(fields);
      let styledHTML = juice(compiledHTML);
      let email = {
        envelope: {
          // Special trick: sets 'Return-Path' header to replyEmail during interaction with SMTP server.
          from: replyEmail, // Should set 'Return-Path: <...>' by sending MAIL FROM command to SMTP server. Does not affect Gmail server.
          to: user.email
        },
        from: fromEmail,
        replyTo: replyEmail,
        to: user.email,
        subject: subject,
        //html: compiledHTML,
        html: styledHTML,
        attachments,
      };
      return sendEmail(email);
    }
  };
};
