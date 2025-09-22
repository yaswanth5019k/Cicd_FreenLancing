import { connect, disconnect } from '../../../../../config/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

async function generateUniqueBid() {
    const db = await connect();
    while (true) {
        // Generate a random 4-digit number prefixed with 'B'
        const bid = 'B' + Math.floor(1000 + Math.random() * 9000).toString();
        
        // Check if this BID already exists
        const existingBusiness = await db.collection('companies').findOne({ bid });
        
        // If no business exists with this ID, return it
        if (!existingBusiness) {
            return bid;
        }
    }
}

export async function POST(request) {
    try {
        const {
            name,
            email,
            companyName,
            address,
            companyEmail,
            password
        } = await request.json();

        const db = await connect();
        
        // Check if company email already exists
        const existingBusiness = await db.collection('companies').findOne({ companyEmail });

        if (existingBusiness) {
            return NextResponse.json(
                { error: 'Company email already registered' },
                { status: 400 }
            );
        }

        // Generate unique BID
        const bid = await generateUniqueBid();
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new business document
        const newBusiness = {
            bid,
            name,
            email,
            companyName,
            address,
            companyEmail,
            password: hashedPassword,
            role: 'business',
            verified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert into companies collection
        await db.collection('companies').insertOne(newBusiness);

        return NextResponse.json({
            message: 'Business registered successfully',
            bid
        });

    } catch (error) {
        console.error('Business registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register business' },
            { status: 500 }
        );
    } finally {
        await disconnect();
    }
} 