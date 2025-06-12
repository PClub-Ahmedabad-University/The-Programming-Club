import { Submission } from "../models/submission.model";
import connectDB from "../lib/db";
import mongoose from 'mongoose';
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.text();
    const parsed = Object.fromEntries(new URLSearchParams(body));
    const submission = new Submission(parsed);
    await submission.save();
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err) {
    console.error('Error saving submission:', err);
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}
