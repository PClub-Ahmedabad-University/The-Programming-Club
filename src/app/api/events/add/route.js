import { addNewEvent } from "../../controllers/event.controller";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
export const POST = async (req) => {
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
    // console.log("going to add new event");
    const event = await addNewEvent(data);
    return NextResponse.json(
      { message: 'Event added successfully', data: event },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
};
// CONVERT THE UPLODED IMAGE TO BASE64 USING THIS IN FRONTEND ITSELF.
// const toBase64 = (file) =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = reject;
//   });

// // Usage:
// const base64Image = await toBase64(file);
// Example request: http://localhost:3000/api/events/add
// Body:
// {
//   "title": "Tech Quiz 2020",
//   "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//   "rules": "Max 2 participants per team. No internet use allowed.",
//   "date": "2025-06-10T14:00:00.000Z",
//   "location": "Auditorium Hall A",
//   "registrationOpen": true,
  // "tag" : "CP",
//   "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
//   "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//   "state": upcomming
// }

// Example response :
// {
//     "message": "Event added successfully",
//     "data": {
//         "title": "Tech Quiz 2020",
//         "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//         "rules": "Max 2 participants per team. No internet use allowed.",
//         "date": "2025-06-10T14:00:00.000Z",
//         "location": "Auditorium Hall A",
//         "registrationOpen": true,
//         "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//         "status": "ongoing",
//         "tag": "CP",
//         "imageUrl": "https://res.cloudinary.com/dhizeooup/image/upload/v1748839448/events/mfswamkfbkwahufmj3g9.png",
//         "_id": "683d2c171025bf32e0d35337",
//         "createdAt": "2025-06-02T04:44:07.730Z",
//         "updatedAt": "2025-06-02T04:44:07.730Z",
//         "__v": 0
//     }
// }