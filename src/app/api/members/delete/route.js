import { NextResponse } from "next/server";
import { deleteMemberById } from "../../controllers/member.controller";
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
export async function DELETE(req) {
  try {
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
    const { id } = await req.json();
    const result = await deleteMemberById(id);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}