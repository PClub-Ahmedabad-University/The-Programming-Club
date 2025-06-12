import { Registration } from '../models/registration.model';
import connectDB from '../lib/db';
function parsePretty(pretty) {
  const result = {};
  if (!pretty) return result;
  pretty.split(',').forEach(pair => {
    const [key, ...rest] = pair.split(':');
    if (key && rest.length) {
      result[key.trim()] = rest.join(':').trim();
    }
  });
  return result;
}
export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    const answers = parsePretty(data.pretty);
    const Registration = new Registration({
      ...data,
      ...answers 
    });
    await Registration.save();
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err) {
    console.error('Error saving Registration:', err);
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}