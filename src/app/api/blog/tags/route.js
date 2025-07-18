import { NextResponse } from "next/server";
import { getBlogsByTags } from "../../controllers/blog.controller.js";
//-------------------------------------------------------------------------------------------------------
// fetches blogs by tags (array)
export const POST = async (req) => {
  try {
    const { tags } = await req.json();
    const result = await getBlogsByTags({ tags });
    return NextResponse.json(result, { status:200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status:400 });
  }
};

// TYPE : POST
// URL: http://localhost:3000/api/blog/tags
// EXAMPLE REQ
// {
//   "tags": ["JavaScript", "melons"]
// }

// EXAMPLE RESPONSE
// [
//     {
//         "_id": "687947d6ba6d19d75f7b1513",
//         "title": "Exploring the w of JavaScript",
//         "slug": "exploring-the-w-of-javascript",
//         "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//         "isAnonymous": true,
//         "author": "Anonymous",
//         "tags": [
//             "JavaScript",
//             "Programming",
//             "WebDev"
//         ],
//         "published": true,
//         "createdAt": "2025-07-17T18:58:30.195Z",
//         "__v": 0,
//         "updatedAt": "2025-07-17T19:11:34.685Z"
//     },
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