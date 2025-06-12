import { Submission } from '../models/submission.model';
import { IncomingForm } from 'formidable';
import { Readable } from 'stream';
import connectDB from '../lib/db';
export const config = {
  api: {
    bodyParser: false, 
  },
};
function parseFormData(req) {
  const form = new IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
export async function POST(req) {
  try {
    await connectDB();
    const { fields } = await parseFormData(req);
    if (fields.rawRequest) {
      try {
        const rawParsed = JSON.parse(fields.rawRequest);
        fields.rawRequest = rawParsed;
      } catch (e) {
        console.warn('rawRequest is not valid JSON');
      }
    }
    const submission = new Submission(fields);
    await submission.save();
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err) {
    console.error('Error saving submission:', err);
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}
