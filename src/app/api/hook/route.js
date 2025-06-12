import { Submission } from '../models/submission.model';
import connectDB from '../lib/db';

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const submission = new Submission(data);
    await submission.save();
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err) {
    console.error('Error saving submission:', err);
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}