import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Check if SMTP is configured
  const isSmtpConfigured = 
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const message = {
        from: `${process.env.EMAIL_FROM || 'noreply@airbnbai.com'}`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(message);
      console.log(`Email Sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('SMTP Mail send failed:', error.message);
      logEmailToConsole(options);
    }
  } else {
    logEmailToConsole(options);
  }
};

const logEmailToConsole = (options) => {
  console.log('\n==================================================');
  console.log(`[MAIL LOG - SMTP NOT CONFIG]`);
  console.log(`TO:      ${options.email}`);
  console.log(`SUBJECT: ${options.subject}`);
  console.log(`BODY:`);
  console.log(options.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  console.log('==================================================\n');
};

export const sendVerificationEmail = async (email, name, token, origin) => {
  const verifyUrl = `${origin}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #FF5A5F; text-align: center;">Welcome to AirbnbAI!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering on AirbnbAI. Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Best regards,<br>The AirbnbAI Team</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'AirbnbAI - Verify Your Email Address',
    html,
  });
};

export const sendResetPasswordEmail = async (email, name, token, origin) => {
  const resetUrl = `${origin}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6C63FF; text-align: center;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset. Please click the button below to choose a new password. This link is valid for 10 minutes:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #6C63FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The AirbnbAI Team</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'AirbnbAI - Reset Your Password',
    html,
  });
};

export const sendBookingConfirmationEmail = async (email, name, bookingDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #00C9A7; text-align: center;">Booking Confirmed! 🎉</h2>
      <p>Hello ${name},</p>
      <p>Your booking request for <strong>${bookingDetails.propertyTitle}</strong> has been successfully confirmed and paid.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <h3 style="color: #333;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Location:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${bookingDetails.location}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Check-in:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${new Date(bookingDetails.checkIn).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Check-out:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${new Date(bookingDetails.checkOut).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Guests:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${bookingDetails.guestCount} guests</td>
        </tr>
        <tr style="border-top: 1px solid #eee; font-size: 1.1em; font-weight: bold;">
          <td style="padding: 12px 0; color: #333;">Total Paid:</td>
          <td style="padding: 12px 0; text-align: right; color: #00C9A7;">₹${bookingDetails.totalPrice}</td>
        </tr>
      </table>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="text-align: center; color: #666;">You can view and manage your reservation details in your guest profile portal.</p>
      <p>Best regards,<br>The AirbnbAI Team</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: `AirbnbAI - Booking Confirmation: ${bookingDetails.propertyTitle}`,
    html,
  });
};
