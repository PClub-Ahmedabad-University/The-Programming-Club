import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { deleteEventGallery } from "@/app/api/controllers/gallery.controller";
const secret = process.env.JWT_SECRET;
export const DELETE = async(req, {params}) => {
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
        const awaitedParams = await params;
        const id = await awaitedParams.id;
        console.log(id);
        // console.log(awaitedParams);
        const deleted = await deleteEventGallery(req, id);
        return NextResponse.json(
            {status:204}
        )
    } catch(e) {
        return NextResponse.json(
            {error:e.message},
            {status:400}
        )
    }
}
// Example request: http://localhost:3000/api/gallery/delete/683c32698b1c911f3109a950
// Rexample Response: 
// {
//     "status": 204
// }