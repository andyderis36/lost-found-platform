import { Resend } from 'resend';

// Initialize Resend with API key (optional for build)
const RESEND_API_KEY = process.env.RESEND_API_KEY || 'dummy-key-for-build';
const resend = new Resend(RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_NAME = 'Lost & Found Platform';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// In development with Resend free tier, we can only send to verified email
// Set this to your email for testing
const DEV_OVERRIDE_EMAIL = process.env.DEV_OVERRIDE_EMAIL || 'andyderis36@gmail.com';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Get the recipient email - in development, override with your email for testing
 */
function getRecipientEmail(originalEmail: string): string {
  // In production or if no override set, use original email
  if (IS_PRODUCTION || !DEV_OVERRIDE_EMAIL) {
    return originalEmail;
  }
  
  // In development, use override email for Resend free tier
  console.log(`📧 [DEV MODE] Redirecting email from ${originalEmail} to ${DEV_OVERRIDE_EMAIL}`);
  return DEV_OVERRIDE_EMAIL;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  // Skip if no real API key (build time or disabled)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
    console.log('📧 ⚠️ Email sending skipped - RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  const recipientEmail = getRecipientEmail(to);

  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: 'Welcome! Please confirm your email',
      replyTo: FROM_EMAIL,
      text: `Hi ${name}!\n\nWelcome to ${APP_NAME}! We're excited to have you on board.\n\nPlease verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.\n\n© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                          🔍 ${APP_NAME}
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                          Hi ${name}! 👋
                        </h2>
                        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Welcome to ${APP_NAME}! We're excited to have you on board.
                        </p>
                        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Please verify your email address to activate your account and start protecting your valuable items.
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px;">
                              <a href="${verifyUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0 0 20px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; color: #2563eb; font-size: 14px; word-break: break-all;">
                          ${verifyUrl}
                        </p>
                        
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          ⏰ This link will expire in <strong>24 hours</strong>.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send verification email:', {
        to: recipientEmail,
        originalTo: to,
        error: error,
        errorName: error.name,
        errorMessage: error.message,
      });
      return { success: false, error };
    }

    console.log('✅ Verification email sent successfully:', {
      to: recipientEmail,
      originalTo: to,
      emailId: data?.id,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
) {
  // Skip if no real API key (build time or disabled)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
    console.log('📧 ⚠️ Email sending skipped - RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const recipientEmail = getRecipientEmail(to);

  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                          🔒 Password Reset
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                          Hi ${name},
                        </h2>
                        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          We received a request to reset your password for your ${APP_NAME} account.
                        </p>
                        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Click the button below to create a new password:
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px;">
                              <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0 0 20px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; color: #dc2626; font-size: 14px; word-break: break-all;">
                          ${resetUrl}
                        </p>
                        
                        <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          ⏰ This link will expire in <strong>1 hour</strong>.
                        </p>
                        
                        <div style="padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
                          <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                            ⚠️ Security Notice
                          </p>
                          <p style="margin: 8px 0 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error };
    }

    console.log('Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

/**
 * Send item scan notification email
 */
export async function sendScanNotificationEmail(
  to: string,
  ownerName: string,
  itemName: string,
  scannerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }
) {
  // Skip if no real API key (build time or disabled)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
    console.log('📧 ⚠️ Email sending skipped - RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const recipientEmail = getRecipientEmail(to);
  
  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: `🔍 Someone Scanned Your Item: ${itemName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Item Scanned Notification</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                          🔍 Item Scanned!
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                          Hi ${ownerName},
                        </h2>
                        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Great news! Someone just scanned the QR code on your item:
                        </p>
                        
                        <div style="padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px; margin-bottom: 30px;">
                          <p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">
                            📦 ${itemName}
                          </p>
                        </div>
                        
                        <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: 600;">
                          Scanner Contact Information:
                        </h3>
                        
                        <div style="padding: 20px; background-color: #f3f4f6; border-radius: 8px; margin-bottom: 20px;">
                          ${scannerInfo.name ? `<p style="margin: 0 0 10px; color: #4b5563; font-size: 15px;"><strong>Name:</strong> ${scannerInfo.name}</p>` : ''}
                          ${scannerInfo.email ? `<p style="margin: 0 0 10px; color: #4b5563; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${scannerInfo.email}" style="color: #2563eb; text-decoration: none;">${scannerInfo.email}</a></p>` : ''}
                          ${scannerInfo.phone ? `<p style="margin: 0 0 10px; color: #4b5563; font-size: 15px;"><strong>Phone:</strong> <a href="tel:${scannerInfo.phone}" style="color: #2563eb; text-decoration: none;">${scannerInfo.phone}</a></p>` : ''}
                          ${scannerInfo.message ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1d5db;"><p style="margin: 0 0 5px; color: #6b7280; font-size: 13px; font-weight: 600;">Message:</p><p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">${scannerInfo.message}</p></div>` : ''}
                        </div>
                        
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          📱 Check your dashboard for more details and scan history.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send scan notification email:', error);
      return { success: false, error };
    }

    console.log('Scan notification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

/**
 * Generate random token for verification/reset
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
