const { NextResponse } = require("next/server")
import { addMember } from "../../controllers/member.controller"
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
export const POST = async(req) => {
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
        const data = await req.json();
        const member = await addMember(data);
        return NextResponse.json(member, { status: 201 });
    } catch(e) {
        return NextResponse.json({error: e.message}, {status : 500});
    }
}
//Auth -> bearer token: jwt token
//Example Request:http://localhost:3000/api/members/add
// ExampleBody:
//   {
//     "name": "baloon",
//     "position": "Member",
//     "term": "2024-2025",
//     "linkedinId": "alice-johnson",
//     "pfpImage":"base65/...."
//   }