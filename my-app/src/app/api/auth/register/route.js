import {connect, disconnect} from '../../../../config/db';
import bcrypt from 'bcryptjs';

async function generateUniqueUserId(db) {
    while (true) {
        // Generate a random 3-digit number
        const userId = Math.floor(Math.random() * 900 + 100).toString();
        
        // Check if this ID already exists
        const existingUser = await db.collection('users').findOne({ userId });
        
        // If no user exists with this ID, return it
        if (!existingUser) {
            return userId;
        }
    }
}

export async function POST(request) {
    try {
        const {email, Password} = await request.json();

        const db = await connect();
        const collection = db.collection('users');

        const existingUser = await collection.findOne({email});

        if(existingUser) 
            return Response.json({
                error:'Email already Exists'
            }, {status:400});
        
        const hashPassword = await bcrypt.hash(Password,10);
        
        // Generate unique user ID
        const userId = await generateUniqueUserId(db);
        
        const newUsr = {
            userId,
            email,
            Password: hashPassword,
            role: 'user',
            createdAt: new Date()
        };

        await collection.insertOne(newUsr);
        
        return Response.json({
            message: "User Successfully Registered",
            userId: userId
        }, {status:200});
        
    } catch(err) {
        return Response.json({
            error: "Internal Server Error"
        }, {status:500})
    } finally {
        await disconnect();
    }
}