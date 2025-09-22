import { verifyRefreshToken, generateAccessToken } from "../../../../config/jwt";
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = await cookieStore.get('refreshToken');

        if (!refreshToken) {
            await cookieStore.delete('accessToken');
            await cookieStore.delete('refreshToken');
            return Response.json({ error: 'No refresh token found' }, { status: 401 });
        }

        try {
            const decoded = verifyRefreshToken(refreshToken.value);
            if (!decoded) {
                await cookieStore.delete('accessToken');
                await cookieStore.delete('refreshToken');
                return Response.json({ error: 'Invalid refresh token' }, { status: 401 });
            }

            // Generate new access token with role
            const newAccessToken = generateAccessToken({ 
                email: decoded.email,
                role: decoded.role || 'user'  // Maintain role information
            });
            
            // Set the new access token cookie
            await cookieStore.set('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 300  // 5 minutes in seconds
            });

            return Response.json({
                message: 'Access Token Refreshed',
                user: {
                    email: decoded.email,
                    role: decoded.role || 'user'  // Include role in response
                }
            }, { status: 200 });
        } catch (tokenError) {
            // Handle JWT verification errors
            console.error('Token verification error:', tokenError);
            await cookieStore.delete('accessToken');
            await cookieStore.delete('refreshToken');
            return Response.json({ error: 'Refresh token expired' }, { status: 401 });
        }
    } catch (error) {
        console.error('Refresh token error:', error);
        const cookieStore = await cookies();
        await cookieStore.delete('accessToken');
        await cookieStore.delete('refreshToken');
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}