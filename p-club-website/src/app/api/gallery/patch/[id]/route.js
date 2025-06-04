import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { updateEventGallery } from "@/app/api/controllers/gallery.controller";
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
        const res = await updateEventGallery(req, id);
        return NextResponse.json(
            {data:res}, 
            {status:200}
        );
    } catch(e){
        return NextResponse.json(
            {error:e.message},
            {status: 400}
        );
    }
}
//Example Request: http://localhost:3000/api/gallery/add
// Example body : 
// {
//   "eventName": "New Event Name (optional)",
//   "newImages": [
//     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
//     "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD..."
//   ],
//   "removeImageUrls": [
//     "https://res.cloudinary.com/.../old_image1.png",
//     "https://res.cloudinary.com/.../old_image2.jpg"
//   ]
// }
// Example response 
// {
//     "data": {
//         "eventName": "New Event Name (optional)",
//         "imageUrls": [
//             "https://res.cloudinary.com/dhizeooup/image/upload/v1748837009/events/fdmq4u5n47hvducujlfl.png",
//             "https://res.cloudinary.com/dhizeooup/image/upload/v1748837011/events/fbv6cbmnuphqdgh7wper.png"
//         ],
//         "_id": "683d2293dbb549fde7aae98a",
//         "createdAt": "2025-06-02T04:03:31.378Z",
//         "updatedAt": "2025-06-02T04:03:31.378Z",
//         "__v": 0
//     }
// }
