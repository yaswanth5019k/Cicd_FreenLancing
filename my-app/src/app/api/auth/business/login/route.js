import { connect, disconnect } from '../../../../../config/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { generateAuthTokens } from '../../../../../config/jwt';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        const db = await connect();
        const collection = db.collection('companies');

        // Only look up by companyEmail
        const existingBusiness = await collection.findOne({ companyEmail: email });

        if (!existingBusiness) {
            return NextResponse.json(
                { error: 'Invalid company email or password' },
                { status: 400 }
            );
        }

        // Verify role is 'company'
        if (existingBusiness.role !== 'business') {
            return NextResponse.json(
                { error: 'Invalid account type. Please use the business login.' },
                { status: 403 }
            );
        }

        const validPassword = await bcrypt.compare(password, existingBusiness.password);

        if (!validPassword) {
            return NextResponse.json(
                { error: 'Invalid company email or password' },
                { status: 400 }
            );
        }

        // Generate tokens with company-specific claims
        const { accessToken, refreshToken } = generateAuthTokens({
            email: existingBusiness.companyEmail,
            role: 'business',
            bid: existingBusiness.bid,
            companyName: existingBusiness.companyName
        });

        // Get cookies instance
        const cookieStore = cookies();

        // Set access token cookie
        cookieStore.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 300 // 5 minutes
        });

        // Set refresh token cookie
        cookieStore.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 900 // 15 minutes
        });

        return NextResponse.json({
            message: 'Login successful',
            business: {
                bid: existingBusiness.bid,
                name: existingBusiness.name,
                companyName: existingBusiness.companyName,
                email: existingBusiness.companyEmail,
                role: 'business'
            }
        });

    } catch (error) {
        console.error('Business login error:', error);
        return NextResponse.json(
            { error: 'Failed to login' },
            { status: 500 }
        );
    } finally {
        await disconnect();
    }
} 