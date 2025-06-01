import { NextResponse } from "next/server";
import { addEventGallery } from "../../controllers/gallery.controller";

export const POST = async(req) => {
    try {
        const urls = await addEventGallery(req)
        return NextResponse.json(
            {data:urls}, 
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
// Example Body:
// {
//   "eventName": "Tech Quiz 2025",
//   "images": [
//     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC...",
//     "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/..."
//   ]
// }
// Example Response:
// {
//     "data": {
//         "eventName": "Tech Quiz 2025",
//         "imageUrls": [
//             "https://res.cloudinary.com/dhizeooup/image/upload/v1748775528/events/fh3fuywd8czak2kpjw9b.png",
//             "https://res.cloudinary.com/dhizeooup/image/upload/v1748775529/events/cp36sxi36mr75lktl2xv.png"
//         ],
//         "_id": "683c32698b1c911f3109a950",
//         "createdAt": "2025-06-01T10:58:49.857Z",
//         "updatedAt": "2025-06-01T10:58:49.857Z",
//         "__v": 0
//     }
// }