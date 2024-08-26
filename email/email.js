const nodemailer = require('nodemailer');

async function sendEmail({ email, subject, message }) {
  try {
    // Create a transporter with secure SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "chinda473@gmail.com",
        pass: "soul qada ibno nueb",
      },
      secure: true, // Use SSL/TLS
    });

    // Define email options
    const mailOptions = {
      from: "chinda473@gmail.com" , 
      to: email,
      subject,
      text: message,
      // html: `<p>${message}</p>`, // Optionally send as HTML
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
}

module.exports = sendEmail;
