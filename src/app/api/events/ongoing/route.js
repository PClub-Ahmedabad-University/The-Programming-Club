import { ongoingEvents } from "../../controllers/event.controller";
import { NextResponse } from "next/server";
export const GET = async (req) => {
  try {
    const events = await ongoingEvents(req);
    return NextResponse.json(
        {data:events},
        {status:200}
    )
  } catch (e) {
    return NextResponse.json(
        { error: e.message }, 
        { status: 400 });
  }
};
//Example request:http://localhost:3000/api/events/ongoing
// Example response:
// {
//     "data": [
//         {
//             "_id": "683c1d7a945c768f28099439",
//             "title": "tech Quiz 2025",
//             "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//             "rules": "Max 2 participants per team. No internet use allowed.",
//             "date": "2025-06-10T14:00:00.000Z",
//             "location": "Auditorium Hall A",
//             "registrationOpen": true,
//             "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//             "status": "ongoing",
//             "imageUrl": "https://res.cloudinary.com/dhizeooup/image/upload/v1748770169/events/nhywwvlayt1f90bd9qwi.png",
//             "createdAt": "2025-06-01T09:29:30.509Z",
//             "updatedAt": "2025-06-01T09:31:53.787Z",
//             "__v": 0
//         }
//     ]
// }