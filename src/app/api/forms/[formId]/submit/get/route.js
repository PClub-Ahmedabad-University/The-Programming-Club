import connectDB  from '@/app/api/lib/db';
import Submission from '@/app/api/models/submission.model';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    // console.log(req);
    // console.log("User ID:",userId)
    const { formId } = params;

    // Validate form ID
    if (!ObjectId.isValid(formId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid form ID format' 
        }), 
        { status: 400 }
      );
    }

    await connectDB();
    
    // Count total submissions for this form
    const response = await Submission.find({ 
      formId: new ObjectId(formId) 
    });
    const totalResponses = await Submission.countDocuments({ 
      formId: new ObjectId(formId) 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalResponses,
        response 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching response count:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch response count' 
      }), 
      { status: 500 }
    );
  }
}
