import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGO_URI;

export async function GET(req, { params }) {
  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid file ID' }, { status: 400 });
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(); 
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const _id = new ObjectId(id);
    const files = await bucket.find({ _id }).toArray();

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(_id);

    return new Response(stream, {
      headers: {
        'Content-Type': file.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json({ success: false, error: 'Download failed' }, { status: 500 });
  }
}
