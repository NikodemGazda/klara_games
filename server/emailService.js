const nodemailer = require('nodemailer');

// Email service configuration
// For development/free tier, use Mailtrap: https://mailtrap.io
// Sign up for free account and copy credentials from Settings > Integrations > Nodemailer

// Example Mailtrap config:
// const transporter = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "YOUR_MAILTRAP_USER",
//     pass: "YOUR_MAILTRAP_PASSWORD"
//   }
// });

// Or use Gmail (requires app password):
// https://support.google.com/accounts/answer/185833
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'your-email@gmail.com',
//     pass: 'your-app-password'
//   }
// });

let transporter = null;

function initializeEmailService(config) {
  transporter = nodemailer.createTransport(config);
}

async function sendWelcomeEmail(email, username, password) {
  if (!transporter) {
    console.warn('Email service not initialized. Skipping welcome email.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: '"Klara Games" <noreply@klarag.local>',
      to: email,
      subject: 'Welcome to Klara Games!',
      html: `
        <h1>Welcome to Klara Games!</h1>
        <p>Your account has been successfully created.</p>
        <p><strong>Your login credentials:</strong></p>
        <ul>
          <li><strong>Username:</strong> ${username}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Visit <a href="http://localhost:3000">Klara Games</a> to start playing!</p>
        <p>Keep these credentials safe. If you forget your password, you can use this email to reset it.</p>
      `,
    });
    console.log('Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

async function sendPasswordResetEmail(email, username, password) {
  if (!transporter) {
    console.warn('Email service not initialized. Skipping password reset email.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: '"Klara Games" <noreply@klarag.local>',
      to: email,
      subject: 'Password Reset - Klara Games',
      html: `
        <h1>Password Reset</h1>
        <p>Here are your login credentials:</p>
        <ul>
          <li><strong>Username:</strong> ${username}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Visit <a href="http://localhost:3000">Klara Games</a> to log in.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    console.log('Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

module.exports = {
  initializeEmailService,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
