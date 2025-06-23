import connectDB from '@/app/api/lib/db';
import { ObjectId } from 'mongodb';
import Form from '@/app/api/models/form.model';

// Enable debug logging
const debug = (...args) => console.log('[DEBUG][FormSubmit]', ...args);

export async function POST(req, { params }) {
  debug('Starting form submission');
  
  try {
    // Ensure params are properly awaited
    const { formId: formIdParam } = await params;
    debug('Request params:', formIdParam);
    
    // Validate form ID
    if (!ObjectId.isValid(formIdParam)) {
      const error = new Error('Invalid form ID format');
      error.status = 400;
      throw error;
    }

    const formId = new ObjectId(formIdParam);
    
    // Get form to include title in submission
    const form = await Form.findOne({ _id: formId }).lean();
    if (!form) {
      const error = new Error('Form not found');
      error.status = 404;
      throw error;
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      debug('Request body:', JSON.stringify(requestBody, null, 2));
    } catch (e) {
      const error = new Error('Invalid JSON in request body');
      error.status = 400;
      throw error;
    }

    const { responses } = requestBody;
    
    // Validate responses
    if (!responses || typeof responses !== 'object' || Object.keys(responses).length === 0) {
      const error = new Error('Invalid or empty responses object');
      error.status = 400;
      throw error;
    }

    debug('Connecting to database...');
    const db = await connectDB().catch(err => {
      console.error('Database connection error:', err);
      throw new Error('Failed to connect to database');
    });
    
    // Create submission document
    const submission = {
      formId,
      title: form.title, // Include form title from the form document
      responses,
      submittedAt: new Date(),
      status: 'submitted',
      metadata: {
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        formTitle: form.title // Include form title in metadata as well
      }
    };

    debug('Saving submission:', JSON.stringify(submission, null, 2));
    
    // Save to database using direct collection access
    const result = await db.collection('formsubmissions').insertOne(submission)
      .catch(err => {
        console.error('Database insert error:', err);
        throw new Error('Failed to save submission to database');
      });

    if (!result.acknowledged) {
      throw new Error('Database operation not acknowledged');
    }

    debug('Submission saved successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        submissionId: result.insertedId,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );

  } catch (error) {
    const status = error.status || 500;
    const errorMessage = error.message || 'Failed to process submission';
    const errorDetails = {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error.details
      })
    };

    console.error('Form submission error:', {
      ...errorDetails,
      status,
      url: req.url,
      method: req.method
      
    });

    return new Response(
      JSON.stringify(errorDetails),
      { 
        status,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
  }
}
