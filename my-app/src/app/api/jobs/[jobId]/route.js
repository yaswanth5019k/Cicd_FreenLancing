import { NextResponse } from 'next/server';
import { connect, disconnect } from '@/config/db';

export async function GET(request, { params }) {
  try {
    const { jobId } = params;
    const db = await connect();
    
    const job = await db.collection('jobs').findOne({ jobId: parseInt(jobId) });
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
} 