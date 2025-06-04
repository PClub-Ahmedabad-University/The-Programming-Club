import { NextResponse } from "next/server";
import { updateEvent } from "../../../controllers/event.controller";
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
export const PATCH = async(req, {params}) => {
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
        console.log(id)
        const updateData = await req.json();
        const updatedEvent = await updateEvent(id, updateData);
        return NextResponse.json(        
            {message: "Event Patched successfully", data :updatedEvent},
            { status: 200 }
        );
    } catch(e) {
            return NextResponse.json(
                { error: e.message },
                { status: 400 }
            );
    }
}
// TYPE: PATCH
// Example request: http://localhost:3000/api/events/patch/683c1584b605e104fb4e227c
// Example Body : 
// {
//   "title": "tech Quiz 2025",
//   "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//   "rules": "Max 2 participants per team. No internet use allowed.",
//   "date": "2025-06-10T14:00:00.000Z",
//   "location": "Auditorium Hall A",
//   "registrationOpen": true,
//   "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
//   "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//   "state" : false
// }
// Example Response 
// {
//     "message": "Event Patched successfully",
//     "data": {
//         "_id": "683c1584b605e104fb4e227c",
//         "title": "tech Quiz 2025",
//         "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//         "rules": "Max 2 participants per team. No internet use allowed.",
//         "date": "2025-06-10T14:00:00.000Z",
//         "location": "Auditorium Hall A",
//         "registrationOpen": true,
//         "imageUrl": "https://res.cloudinary.com/dhizeooup/image/upload/v1748768132/events/l0eott77ovcxmy4ctctv.png",
//         "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//         "createdAt": "2025-06-01T08:55:32.858Z",
//         "updatedAt": "2025-06-01T08:57:57.722Z",
//         "__v": 0
//     }
// }
