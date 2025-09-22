import { NextResponse } from 'next/server';
import { connect, disconnect } from '../../../../config/db';
import nodemailer from 'nodemailer';

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Generate a random 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connect();
    const collection = db.collection('verificationCodes');

    // Check if a code was recently sent (within last 30 seconds)
    const recentCode = await collection.findOne({
      email,
      createdAt: { $gt: new Date(Date.now() - 30 * 1000) }
    });

    if (recentCode) {
      const timeLeft = Math.ceil((recentCode.createdAt.getTime() + 30000 - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Please wait ${timeLeft} seconds before requesting a new code` },
        { status: 429 }
      );
    }

    // Delete any existing codes for this email
    await collection.deleteMany({ email });

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store verification code with expiration (5 minutes)
    await collection.insertOne({
      email,
      code: verificationCode,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send verification email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}. This code will expire in 5 minutes.`,
      html: `
        <h2>Your Verification Code</h2>
        <p>Use the following code to verify your email:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #4a5568;">${verificationCode}</h1>
        <p>This code will expire in 5 minutes.</p>
        <p>You can request a new code after 30 seconds if needed.</p>
      `,
    });

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
}

export async function PUT(request) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connect();
    const collection = db.collection('verificationCodes');
    
    // Find and validate verification code
    const verificationRecord = await collection.findOne({
      email,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Delete the used verification code
    await collection.deleteOne({ _id: verificationRecord._id });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Code verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
} 