import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(request) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { dreamRole, currentSkills } = await request.json();

    if (!dreamRole) {
      return Response.json(
        { error: 'Dream role is required' },
        { status: 400 }
      );
    }

    const prompt = `As a career mentor, create a detailed roadmap for someone who wants to become a ${dreamRole}.
    Their current skills are: ${currentSkills || 'No prior experience'}.
    
    Please provide:
    1. A structured learning path with 5 major milestones
    2. For each milestone, list 3-4 specific goals that are measurable and achievable
    3. Recommended resources or certifications for each milestone
    4. Estimated time to achieve each milestone
    
    Format the response in a clear, structured way that can be easily parsed into sections.
    Keep the response concise and focused on actionable steps.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      throw new Error('Failed to get response from Gemini API');
    }

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return Response.json({ 
      roadmap: text,
      success: true 
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    
    let errorMessage = 'Failed to generate roadmap';
    let statusCode = 500;

    if (error.message === 'GEMINI_API_KEY is not configured') {
      errorMessage = 'API configuration error';
      statusCode = 503;
    } else if (error.message.includes('Failed to get response')) {
      errorMessage = 'Service temporarily unavailable';
      statusCode = 503;
    }

  
    return Response.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
} 