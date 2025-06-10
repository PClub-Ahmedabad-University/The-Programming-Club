import { NextResponse } from "next/server";
import { getAllEventGalleries } from "@/app/api/controllers/gallery.controller";
import jwt from "jsonwebtoken"; 
const secret = process.env.JWT_SECRET;
export const GET = async (req) => {
  try {
    // const authHeader = req.headers.get('authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const token = authHeader.split(' ')[1];
    // let decoded;
    // try {
    //     decoded = jwt.verify(token, secret);
    // } catch (err) {
    //     return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    // }
    // if (decoded.role !== 'admin') {
    //     return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    // }
    const galleries = await getAllEventGalleries();
    return NextResponse.json({ data: galleries }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
};