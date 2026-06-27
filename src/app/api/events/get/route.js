import { getEvents } from "../../controllers/event.controller";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
export const GET = async(req) => {
    try {   
        const { searchParams } = new URL(req.url);
        let page = parseInt(searchParams.get("page") || "1");
        let limit = parseInt(searchParams.get("limit") || "6");
        const type = searchParams.get("type") || "ALL";

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 6;
        if (limit > 100) limit = 100;

        const result = await getEvents(page, limit, type);
        return NextResponse.json(
            {
                success: true,
                data: result.data,
                pagination: result.pagination
            },
            {status:200}
        );   
    } catch(e){
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
};
//BEARER-TOKEN -> AUTH
//EXAMPLE REQUEST: http://localhost:3000/api/events/get
// EXAMPLE RESPONESE
// {
//     "data": [
//         {
//             "_id": "683c0b19b605e104fb4e2270",
//             "title": "Tech Quiz 2025",
//             "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//             "rules": "Max 2 participants per team. No internet use allowed.",
//             "date": "2025-06-10T14:00:00.000Z",
//             "location": "Auditorium Hall B",
//             "registrationOpen": true,
//             "imageUrl": "https://res.cloudinary.com/dhizeooup/image/upload/v1748765464/events/pbaiufmmsitdjeovb0ey.png",
//             "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//             "createdAt": "2025-06-01T08:11:05.036Z",
//             "updatedAt": "2025-06-01T08:11:05.036Z",
//             "__v": 0
//         },
//         {
//             "_id": "683c0e21b605e104fb4e2274",
//             "title": "Tech Quiz 2020",
//             "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//             "rules": "Max 2 participants per team. No internet use allowed.",
//             "date": "2025-06-10T14:00:00.000Z",
//             "location": "Auditorium Hall A",
//             "registrationOpen": true,
//             "imageUrl": "https://res.cloudinary.com/dhizeooup/image/upload/v1748766241/events/pbrdmr6a8ixjoblwhvar.png",
//             "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//             "createdAt": "2025-06-01T08:24:01.942Z",
//             "updatedAt": "2025-06-01T08:24:01.942Z",
//             "__v": 0
//         }
//     ]
// }