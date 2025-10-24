import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

// Test endpoint to send verification email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';
    const name = searchParams.get('name') || 'Test User';
    
    console.log('🧪 Testing email send to:', email);
    
    // Generate test token
    const testToken = 'test-token-123456';
    
    // Send email
    const result = await sendVerificationEmail(email, name, testToken);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully! Check your inbox (or spam folder)',
        data: result.data,
        note: 'In DEV mode, email goes to andyderis36@gmail.com',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send email',
        error: result.error,
        troubleshoot: [
          '1. Check if RESEND_API_KEY is set in .env.local',
          '2. Verify your email at https://resend.com/settings/domains',
          '3. Check Resend dashboard at https://resend.com/emails',
          '4. Make sure andyderis36@gmail.com is verified in Resend',
        ],
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error sending test email',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
