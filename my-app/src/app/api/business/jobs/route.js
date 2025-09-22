import { NextResponse } from 'next/server';
import { connect, disconnect } from '../../../../config/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '../../../../config/jwt';

// Helper function to verify business auth
async function verifyBusinessAuth() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
        throw new Error('Unauthorized');
    }

    const decoded = verifyAccessToken(accessToken.value);
    
    if (!decoded || decoded.role !== 'business') {
        throw new Error('Unauthorized');
    }

    return decoded;
}

export async function GET() {
    try {
        // Verify business authentication
        const decoded = await verifyBusinessAuth();
        
        const db = await connect();
        
        // Only fetch jobs posted by this company
        const jobs = await db.collection('jobs')
            .find({ companyEmail: decoded.email })
            .sort({ postedDate: -1 })
            .toArray();

        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching company jobs:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch jobs' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    } finally {
        await disconnect();
    }
}

export async function POST(request) {
    try {
        // Verify business authentication
        const decoded = await verifyBusinessAuth();
        
        const db = await connect();
        const jobData = await request.json();

        // Generate unique job ID
        const jobId = 'J' + Math.floor(100000 + Math.random() * 900000).toString();
        
        // Create job with company information
        const job = {
            ...jobData,
            jobId,
            companyEmail: decoded.email,
            companyName: decoded.companyName,
            bid: decoded.bid,
            postedDate: new Date(),
            status: 'Active',
            applicants: 0
        };

        await db.collection('jobs').insertOne(job);

        return NextResponse.json({
            message: 'Job posted successfully',
            jobId
        });
    } catch (error) {
        console.error('Error posting job:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to post job' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    } finally {
        await disconnect();
    }
}

export async function PUT(request) {
    try {
        // Verify business authentication
        const decoded = await verifyBusinessAuth();
        
        const db = await connect();
        const { jobId, ...updateData } = await request.json();

        // Only allow updating own jobs
        const result = await db.collection('jobs').findOneAndUpdate(
            { 
                jobId,
                companyEmail: decoded.email // Ensure company owns this job
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Job not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Job updated successfully',
            job: result
        });
    } catch (error) {
        console.error('Error updating job:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update job' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    } finally {
        await disconnect();
    }
}

export async function DELETE(request) {
    try {
        // Verify business authentication
        const decoded = await verifyBusinessAuth();
        
        const db = await connect();
        const { jobId } = await request.json();

        // Only allow deleting own jobs
        const result = await db.collection('jobs').deleteOne({
            jobId,
            companyEmail: decoded.email // Ensure company owns this job
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Job not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete job' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    } finally {
        await disconnect();
    }
} 