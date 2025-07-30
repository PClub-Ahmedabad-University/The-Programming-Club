import { NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import { MongoClient, GridFSBucket } from 'mongodb';
import Busboy from 'busboy';
import fileModel from '../../models/file.model';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  await connectDB();

  const client = await MongoClient.connect(process.env.MONGO_URI);
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: Object.fromEntries(req.headers.entries()),
    });

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: mimetype,
        metadata: { uploadedBy: 'admin' },
      });

      file.pipe(uploadStream);

      uploadStream.on('finish', async () => {
        try {
          await fileModel.create({
            name: filename,           // ✅ Ensure this is a plain string
            type: 'file',
            parentId: null,
            fileId: uploadStream.id,
            mimeType: mimetype,
          });

          resolve(
            NextResponse.json({
              success: true,
              file: {
                id: uploadStream.id,
                filename,
                mimetype,
              },
            })
          );
        } catch (err) {
          console.error('Mongo Save Error:', err);
          reject(
            NextResponse.json(
              {
                success: false,
                error: 'DB insert failed',
                details: err.message,
              },
              { status: 500 }
            )
          );
        }
      });

      uploadStream.on('error', (err) => {
        console.error('Upload Error:', err);
        reject(
          NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
        );
      });
    });

    const reader = req.body.getReader();
    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      },
    });

    const nodeStream = require('stream').Readable.fromWeb(stream);
    nodeStream.pipe(busboy);
  });
}
