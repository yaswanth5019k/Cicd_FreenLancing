import { NextResponse } from 'next/server';
import { connect } from '@/config/db';
import { GridFSBucket, ObjectId } from 'mongodb';

async function generateUniqueUserId(db) {
  while (true) {
    // Generate a random 3-digit number
    const userId = Math.floor(Math.random() * 900 + 100).toString();
    
    // Check if this ID already exists
    const existingUser = await db.collection('applications').findOne({ userId });
    
    // If no user exists with this ID, return it
    if (!existingUser) {
      return userId;
    }
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const db = await connect();
    
    // Get form fields
    const jobId = formData.get('jobId');
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const coverLetter = formData.get('coverLetter');
    const resume = formData.get('resume');

    // Generate a unique 3-digit user ID
    const userId = await generateUniqueUserId(db);
    
    // Store resume in GridFS if provided
    let resumeId = null;
    if (resume) {
      const bucket = new GridFSBucket(db);
      const uploadStream = bucket.openUploadStream(`${userId}_resume.pdf`);
      const buffer = Buffer.from(await resume.arrayBuffer());
      
      await new Promise((resolve, reject) => {
        uploadStream.end(buffer, (error) => {
          if (error) reject(error);
          else resolve();
        });
        resumeId = uploadStream.id;
      });
    }

    const application = {
      userId,
      jobId,
      fullName,
      email,
      phone,
      coverLetter,
      resumeId, // Store the GridFS file ID
      status: 'Pending',
      appliedDate: new Date()
    };

    await db.collection('applications').insertOne(application);
    
    // Update the job's applicant count
    await db.collection('jobs').updateOne(
      { jobId },
      { $inc: { applicants: 1 } }
    );

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      userId 
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await connect();
    const applications = await db.collection('applications')
      .find({})
      .sort({ appliedDate: -1 })
      .toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const db = await connect();
    const { _id, status } = await request.json();
    
    const result = await db.collection('applications').findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
} 