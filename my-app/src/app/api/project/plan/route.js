import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Project title and description are required' },
        { status: 400 }
      );
    }

    const prompt = `Create a detailed project plan for the following project:
Title: ${title}
Description: ${description}

Break down the project into phases. For each phase include:
1. Phase title
2. List of specific tasks to complete
3. Expected deliverables
4. Time estimate

Format the response with clear section headers for each phase, using "Phase 1:", "Phase 2:", etc.
Include tasks as numbered lists.
List deliverables under a "Deliverables:" section.
Include time estimate under "Time Estimate:".

Keep the phases focused and actionable.`;

    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const plan = response.text();

    return NextResponse.json({ plan });

  } catch (error) {
    console.error('Project plan generation error:', error);

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate project plan' },
      { status: 500 }
    );
  }
} 