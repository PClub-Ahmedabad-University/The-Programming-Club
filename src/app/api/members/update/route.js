import { NextResponse } from "next/server";
import { updateMemberById } from "../../controllers/member.controller";
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

export async function PUT(req) {
  try {
    // Uncomment and adjust the authentication check when ready
    /*
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }
    */
    
    const { id, ...updateData } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    const result = await updateMemberById(id, updateData);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes('not found') ? 404 : 500 }
    );
  }
}