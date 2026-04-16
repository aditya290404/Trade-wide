import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { AppError } from './AppError';

dotenv.config();

export const sendOTPEmail = async (to: string, otp: string) => {
  let apiKey = process.env.SENDGRID_API_KEY || '';
  
  // Clean the API key in case of accidental spaces or quotes from Docker/ENV
  apiKey = apiKey.trim().replace(/^["'](.+)["']$/, '$1');

  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.warn('⚠️ SendGrid API Key is missing or invalid (must start with "SG."). Skipping email sending.');
    console.log(`DEBUG: Verification code for ${to} is ${otp}`);
    return; // Proceed without throwing so registration doesn't fail
  }

  try {
    sgMail.setApiKey(apiKey);
  } catch (err) {
    console.error('❌ Failed to set SendGrid API Key:', err);
    return;
  }

  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM_EMAIL || '', // Use the email address or domain you verified
    subject: 'Your Stellar Trade Verification Code',
    text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4A90E2; text-align: center;">Verify Your Account</h2>
        <p>Hello,</p>
        <p>Thank you for choosing <strong>Stellar Trade</strong>. To complete your registration, please use the following verification code:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 4px;">
          ${otp}
        </div>
        <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2026 Stellar Trade. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const response = await sgMail.send(msg);
    console.log(`✅ Success: OTP Email sent to ${to}. SendGrid Response:`, response[0].statusCode);
  } catch (error: any) {
    console.error('❌ Error sending email via SendGrid:', error);
    if (error.response) {
      console.error('SendGrid Error Body:', JSON.stringify(error.response.body, null, 2));
    }
    // We throw an AppError so it's treated as operational and can be shown to the user
    throw new AppError('Failed to send verification email. Please check your SendGrid sender verification.', 500);
  }
};
