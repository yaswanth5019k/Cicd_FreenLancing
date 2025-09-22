import { connect, disconnect } from '../../../config/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '../../../config/jwt';

// Get user profile
export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');
        
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const decoded = verifyAccessToken(accessToken.value);
        if (!decoded.username) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = await connect();
        const user = await db.collection('users').findOne(
            { email: decoded.username },
            { projection: { Password: 0 } }
        );

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await disconnect();
    }
}

// Update user profile
export async function PUT(request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');
        
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const decoded = verifyAccessToken(accessToken.value);
        if (!decoded.username) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const profileData = await request.json();
        
        // Remove sensitive fields
        const { Password, email, role, ...updateData } = profileData;

        const db = await connect();
        const result = await db.collection('users').updateOne(
            { email: decoded.username },
            { 
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            message: 'Profile updated successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await disconnect();
    }
} 