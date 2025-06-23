import Form from '../models/form.model.js';
import connectDB from '../lib/db';

export async function POST(req) {
  const body = await req.json();
  const { title, fields } = body;
  const db = await connectDB();
  const newForm = await Form.create({ title, fields });

  return new Response(JSON.stringify({ _id: newForm._id }), { status: 201 });
}

export async function GET() {
    const db = await connectDB();
    const forms = await Form.find();
    return new Response(JSON.stringify(forms), { status: 200 });
}
