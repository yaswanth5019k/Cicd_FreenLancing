import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-callback`;

// Debug logging
console.log('Environment variables check:', {
  hasClientId: !!GOOGLE_CLIENT_ID,
  hasClientSecret: !!GOOGLE_CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
  appUrl: process.env.NEXT_PUBLIC_APP_URL
});

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

export async function POST(request) {
  console.log('Starting Google OAuth process...');
  try {
    // Validate environment variables
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth credentials:', {
        hasClientId: !!GOOGLE_CLIENT_ID,
        hasClientSecret: !!GOOGLE_CLIENT_SECRET
      });
      return NextResponse.json(
        { error: 'Google OAuth configuration is missing' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Missing NEXT_PUBLIC_APP_URL:', {
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      });
      return NextResponse.json(
        { error: 'Application URL configuration is missing' },
        { status: 500 }
      );
    }

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    console.log('Generating auth URL with scopes:', scopes);
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      prompt: 'consent'  // Force consent screen to ensure refresh token
    });

    console.log('Successfully generated auth URL:', authUrl);
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Google OAuth Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        error: 'Failed to initialize Google sign in', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 