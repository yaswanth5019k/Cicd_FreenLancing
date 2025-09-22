import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const cookieStore = cookies();
        
        // Clear auth tokens
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');

        return NextResponse.json({ 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ 
            error: 'Failed to logout' 
        }, { status: 500 });
    }
} 