import { Submission } from "../models/submission.model";
import connectDB from "../lib/db";
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const submission = new Submission(data);
    await submission.save();
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error saving submission:', error);
    return new Response(JSON.stringify({ status: 'error', error: error.message }), {
      status: 500,
    });
  }
}
