import { postNewBlog, getAllBlogs } from "../controllers/blog.controller";
import { NextResponse } from "next/server";
//-------------------------------------------------------------------------------------------------------
//creats a new blog 
export const POST = async (req) => {
  try {
    const data = await req.json();
    const result = await postNewBlog(data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};
//TYPE : POST
// URL : http://localhost:3000/api/blog
// !!!! author : emailid 
// EXAMPLE REQ
// {
//   "title": "Exploring the Depths of JavaScript",
//   "description": "A deep dive into closures, event loop, and async/await patterns.",
//   "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//   "author": "Anonymous", / "author" : "jay.s7@ahduni.edu.in"
//   "tags": ["JavaScript", "Programming", "melons"],
//   "anonymous": true
// }
// EXAMPLE RESPONSE 
// {
//     "title": "Exploring the Depths of JavaScript",
//     "slug": "exploring-the-depths-of-javascript",
//     "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//     "isAnonymous": true,
//     "author": "Anonymous",
//     "tags": [
//         "JavaScript",
//         "Programming",
//         "melons"
//     ],
//     "published": true,
//     "_id": "6879e5e75ec9bc85d24eab95",
//     "createdAt": "2025-07-18T06:12:55.164Z",
//     "updatedAt": "2025-07-18T06:12:55.164Z",
//     "__v": 0
// }
//-------------------------------------------------------------------------------------------------------
// fetches all the blogs
export const GET = async () => {
  try {
    const result = await getAllBlogs();
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};
// TYPE : GET
// URL http://localhost:3000/api/blog
// EXAMPLE REPONSE 
// [
//     {
//         "_id": "6879e5e75ec9bc85d24eab95",
//         "title": "Exploring the Depths of JavaScript",
//         "slug": "exploring-the-depths-of-javascript",
//         "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//         "isAnonymous": true,
//         "author": "Anonymous",
//         "tags": [
//             "JavaScript",
//             "Programming",
//             "melons"
//         ],
//         "published": true,
//         "createdAt": "2025-07-18T06:12:55.164Z",
//         "updatedAt": "2025-07-18T06:12:55.164Z",
//         "__v": 0
//     }
// ]
//-------------------------------------------------------------------------------------------------------