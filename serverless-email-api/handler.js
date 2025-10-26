require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

function validatePayload(body) {
  if (!body) return 'Missing JSON body.';
  const { receiver_email, subject, body_text } = body;
  if (!receiver_email) return 'receiver_email is required.';
  if (!subject) return 'subject is required.';
  if (!body_text) return 'body_text is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(receiver_email)) return 'receiver_email must be a valid email.';
  return null;
}

exports.sendEmail = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : null;

    const validationError = validatePayload(body);
    if (validationError) {
      return { statusCode: 400, body: JSON.stringify({ error: validationError }) };
    }

    if (!SENDGRID_API_KEY) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Email provider not configured: SENDGRID_API_KEY missing.' })
      };
    }

    const { receiver_email, subject, body_text } = body;

    const msg = {
      to: receiver_email,
      from: FROM_EMAIL,
      subject,
      text: body_text,
    };

    await sgMail.send(msg);

    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Email sent.' }) };
  } catch (error) {
    console.error('sendEmail error:', error);

    if (error.response && error.response.body) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Email provider error', details: error.response.body }) };
    }

    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
