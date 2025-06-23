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
