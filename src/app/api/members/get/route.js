import { NextResponse } from 'next/server';
import { getAllMember } from '../../controllers/member.controller';
export async function GET(_req) {
  try {
    const members = await getAllMember();
    return NextResponse.json(members, { status: 200 });
  } catch(e) {
    return NextResponse.json({error: e.message}, {status : 500});
  }
}
//Example Request: http://localhost:3000/api/members/get
// Example response: 
//[
//     {
//         "_id": "684073f552650cebea8930a7",
//         "name": "Alice Johnson",
//         "position": "Secretary",
//         "term": "2024-2025",
//         "linkedinId": "alice-johnson",
//         "pfpImage": "https://res.cloudinary.com/dhizeooup/image/upload/v1749054453/events/e5kdqfy6pce37xlytfd2.png",
//         "createdAt": "2025-06-04T16:27:34.025Z",
//         "updatedAt": "2025-06-04T16:27:34.025Z",
//         "__v": 0
//     },
//     {
//         "_id": "684105b352650cebea8930bc",
//         "name": "shoe beat",
//         "position": "Joint Secretary",
//         "term": "2024-2025",
//         "linkedinId": "alice-johnson",
//         "pfpImage": "https://res.cloudinary.com/dhizeooup/image/upload/v1749091763/events/raxu62jvcowaubooswql.png",
//         "createdAt": "2025-06-05T02:49:23.552Z",
//         "updatedAt": "2025-06-05T02:49:23.552Z",
//         "__v": 0
//     },
//     {
//         "_id": "684106b752650cebea8930c1",
//         "name": "capper",
//         "position": "Dev Lead",
//         "term": "2024-2025",
//         "linkedinId": "alice-johnson",
//         "pfpImage": "https://res.cloudinary.com/dhizeooup/image/upload/v1749092024/events/fcc5usvcvr5botdw1nmh.png",
//         "createdAt": "2025-06-05T02:53:43.656Z",
//         "updatedAt": "2025-06-05T02:53:43.656Z",
//         "__v": 0
//     },
//     {
//         "_id": "68410a863dfd5aaad7f81ca4",
//         "name": "mangopink",
//         "position": "Member",
//         "term": "2024-2025",
//         "linkedinId": "alice-johnson",
//         "pfpImage": "https://res.cloudinary.com/dhizeooup/image/upload/v1749092998/events/qomvg3kjmtoid1mlcsaf.png",
//         "createdAt": "2025-06-05T03:09:58.281Z",
//         "updatedAt": "2025-06-05T03:09:58.281Z",
//         "__v": 0
//     },
//     {
//         "_id": "68410ce7e25dd44129df958f",
//         "name": "baloon",
//         "position": "Member",
//         "term": "2024-2025",
//         "linkedinId": "alice-johnson",
//         "pfpImage": "https://res.cloudinary.com/dhizeooup/image/upload/v1749093608/events/ldhtxkwrcccfj5dkld81.png",
//         "createdAt": "2025-06-05T03:20:07.690Z",
//         "updatedAt": "2025-06-05T03:20:07.690Z",
//         "__v": 0
//     }
// ]