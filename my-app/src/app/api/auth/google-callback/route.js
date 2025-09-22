import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect, disconnect } from '../../../../config/db';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-callback`
);

export async function GET(request) {
  try {
    // Get the code from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=No_code_provided`);
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Connect to database
    const db = await connect();
    const collection = db.collection('users');

    try {
      // Check if user exists, if not create them
      let user = await collection.findOne({ email: data.email });
      
      if (!user) {
        const result = await collection.insertOne({
          email: data.email,
          name: data.name,
          picture: data.picture,
          role: 'user',
          authProvider: 'google',
          createdAt: new Date()
        });
        
        user = {
          email: data.email,
          name: data.name,
          picture: data.picture,
          role: 'user',
          _id: result.insertedId
        };
      }

      // Create JWT tokens
      const accessToken = jwt.sign(
        { 
          email: user.email,
          role: user.role || 'user'
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: '15m' }  // 15 minutes
      );

      const refreshToken = jwt.sign(
        { 
          email: user.email,
          role: user.role || 'user'
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: '7d' }  // 7 days
      );

      // Set cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      };

      const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
      
      response.cookies.set('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15,  // 15 minutes in seconds
      });

      response.cookies.set('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 45,  // 7 days in seconds
      });

      return response;
    } finally {
      await disconnect();
    }
  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    const errorMessage = encodeURIComponent(
      process.env.NODE_ENV === 'development' 
        ? `Authentication failed: ${error.message}`
        : 'Authentication failed'
    );
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${errorMessage}`);
  }
} 