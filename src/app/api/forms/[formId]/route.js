import { MongoClient, ObjectId } from 'mongodb';
import Form from '@/app/api/models/form.model.js';
import Submission from '@/app/api/models/submission.model.js';

// Initialize MongoDB connection
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  throw new Error('MongoDB connection string is missing');
}

const client = new MongoClient(uri);
let clientPromise;

// Reuse connection in development
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

// Utility to get the database
async function getDb() {
  try {
    const client = await clientPromise;
    const dbName = new URL(uri).pathname.substring(1) || 'pclub';
    return client.db(dbName);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error('Failed to connect to the database');
  }
}

// GET handler for fetching a form by ID
export async function GET(req, { params }) {
  const userId = req.headers.get('x-user-id');
  console.log('User ID:', userId);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID not found' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const submitted = await Submission.findOne({ formId: params.formId, userId });
  if(submitted){
    return new Response(
      JSON.stringify({ submitted: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
  console.log('🔍 API: Fetching form with ID:', params.formId);

  if (!params.formId) {
    return new Response(
      JSON.stringify({ error: 'Form ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
  
    if (!ObjectId.isValid(params.formId)) {
      console.error('❌ Invalid ObjectId format:', params.formId);
      return new Response(
        JSON.stringify({ error: 'Invalid Form ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDb();
    console.log('✅ Connected to database');

    const objectId = new ObjectId(params.formId);
    console.log('🔍 Querying form with ObjectId:', objectId);
    
    let form = await Form.findOne({ _id: objectId });
    
    if (!form) {
      console.log('⚠️ Form not found with Mongoose, trying direct collection access');
      form = await Form.findOne({ _id: objectId });
    }

    if (!form) {
      console.log('⚠️ Form not found in database');
      return new Response(
        JSON.stringify({ error: 'Form not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Form found');
    const response = {
      ...form,
      _id: form._id.toString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/forms/[formId]:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(req, { params }) {
  if (!params.formId) {
    return new Response(
      JSON.stringify({ error: 'Form ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (!ObjectId.isValid(params.formId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Form ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { title, fields, state } = body;

    if (!title || !Array.isArray(fields)) {
      return new Response(
        JSON.stringify({ error: 'Title and fields are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process fields to ensure they have the required structure
    const processedFields = fields.map(field => ({
      ...field,
      // Use name as label if label doesn't exist (for backward compatibility)
      label: field.label || field.name,
      // Ensure options have name and value
      options: field.options?.map(opt => ({
        ...opt,
        // Use name as label if it doesn't exist (for backward compatibility)
        label: opt.label || opt.name || opt.value
      })) || []
    }));

    const objectId = new ObjectId(params.formId);
    
    // Update the form
    const updatedForm = await Form.findOneAndUpdate(
      { _id: objectId },
      { 
        title,
        fields: processedFields,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedForm) {
      return new Response(
        JSON.stringify({ error: 'Form not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Form updated successfully',
        form: updatedForm 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error updating form:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update form',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(req, { params }) {
  if (!params.formId) {
    return new Response(
      JSON.stringify({ error: 'Form ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (!ObjectId.isValid(params.formId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Form ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { state, fields } = body;

    // Validate request
    if (state === undefined && !fields) {
      return new Response(
        JSON.stringify({ error: 'Either state or fields must be provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDb();
    const objectId = new ObjectId(params.formId);
    
    // Find the current form
    const currentForm = await Form.findOne({ _id: objectId });
    if (!currentForm) {
      return new Response(
        JSON.stringify({ error: 'Form not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data
    const updateData = { updatedAt: new Date() };
    
    // Handle state update if provided
    if (state !== undefined) {
      updateData.state = state;
    }
    
    // Handle fields update if provided
    if (Array.isArray(fields)) {
      updateData.fields = fields.map(field => ({
        ...field,
        // Use name as label if label doesn't exist (for backward compatibility)
        label: field.label || field.name,
        // Ensure options have name and value
        options: field.options?.map(opt => ({
          ...opt,
          // Use name as label if it doesn't exist (for backward compatibility)
          label: opt.label || opt.name || opt.value
        })) || []
      }));
    }
    
    // Update the form
    const updatedForm = await Form.findOneAndUpdate(
      { _id: objectId },
      updateData,
      { new: true }
    );

    return new Response(
      JSON.stringify({ 
        message: 'Form state updated successfully',
        state: updatedForm.state 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error toggling form state:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update form state',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
