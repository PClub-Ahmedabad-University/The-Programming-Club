import { getBlogById, patchBlog, deleteBlog } from "../../controllers/blog.controller";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
//-------------------------------------------------------------------------------------------------------
// fetches blog by id (from params) or by author (from body)
export const GET = async (req, { params }) => {
  try {
    const awaitedParams = await params;

    if (awaitedParams && awaitedParams.id) {
      const result = await getBlogById(awaitedParams.id);
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json(
      { error: "Please provide 'author' in body or 'id' in params." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

//TYPE: POST
// GET_BY_ID
//EXAMPLE URL: http://localhost:3000/api/blog/687947d6ba6d19d75f7b1513
//RESPONSE:
// {
//     "_id": "687947d6ba6d19d75f7b1513",
//     "title": "Exploring the w of JavaScript",
//     "slug": "exploring-the-w-of-javascript",
//     "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//     "isAnonymous": true,
//     "author": "Anonymous",
//     "tags": [
//         "JavaScript",
//         "Programming",
//         "WebDev"
//     ],
//     "published": true,
//     "createdAt": "2025-07-17T18:58:30.195Z",
//     "__v": 0,
//     "updatedAt": "2025-07-17T19:11:34.685Z"
// }

//GET_BLOG_BY_AUTHOR
//EXAMPLE URL: http://localhost:3000/api/blog/jay.s7@ahduni.edu.in
//EXAMPLE BODY : 
// {
//     "author" : "jay.s7@ahduni.edu.in"
// }
//EXAMPLE RESPONSE 
//[
//     {
//         "_id": "6879eac15ec9bc85d24eab9d",
//         "title": "Exploring the heights of JavaScript",
//         "slug": "exploring-the-heights-of-javascript",
//         "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//         "isAnonymous": true,
//         "author": "jay.s7@ahduni.edu.in",
//         "tags": [
//             "JavaScript",
//             "Programming",
//             "melons"
//         ],
//         "published": true,
//         "createdAt": "2025-07-18T06:33:37.740Z",
//         "updatedAt": "2025-07-18T06:33:37.740Z",
//         "__v": 0
//     }
// ]
//-------------------------------------------------------------------------------------------------------
// updates a blog by id
export const PATCH = async (req, { params }) => {
  try {
    const data = await req.json();
    const awaitedParams = await params;
    if (!mongoose.Types.ObjectId.isValid(awaitedParams.id)) {
    throw new Error('Invalid blog ID.');
    }
    const result = await patchBlog(awaitedParams.id, data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};
// TYPE : PATCH
// E.G. URL : http://localhost:3000/api/blog/6879455d6d62013c0058d2e3
// E.G. REQ BODY :
// this contains the updated object
// {
//   "title": "Exploring the heights of JavaScript",
//   "description": "A deep dive into closures, event loop, and async/await patterns.",
//   "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//   "author": "Anonymous",
//   "tags": ["JavaScript", "Programming", "WebDev"],
//   "anonymous": true
// }
// E.G. RESPONSE 
// {
//   "title": "Exploring the heights of JavaScript",
//   "description": "A deep dive into closures, event loop, and async/await patterns.",
//   "content": "# JavaScript Deep Dive\n\nLet's talk about **closures**, the **event loop**, and why `async/await` is magic.\n\n## Closures\n\nClosures allow functions to access variables from an enclosing scope:\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  }\n}\n```\n\n## Async/Await\n\nInstead of chaining promises, use `async/await`:\n\n```js\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```",
//   "author": "Anonymous",
//   "tags": ["JavaScript", "Programming", "WebDev"],
//   "anonymous": true
// }
//-------------------------------------------------------------------------------------------------------

// deletes a blog by id
export const DELETE = async (req, { params }) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication token missing' 
      }, { status: 401 });
    }
    
    // Create a request-like object with headers for the controller
    const request = {
      headers: {
        authorization: authHeader
      }
    };
    
    // Pass the request object to deleteBlog
    const result = await deleteBlog(params.id, request);
    
    return NextResponse.json({ 
      success: true,
      message: result.message 
    }, { status: 200 });
  } catch (err) {
    console.error('Delete blog error:', err);
    const status = err.message.includes('authorized') ? 403 : 400;
    return NextResponse.json({ 
      success: false,
      error: err.message 
    }, { status });
  }
};

// TYPE : DELETE
// EG URL: http://localhost:3000/api/blog/687947d6ba6d19d75f7b1513
// E.G. REPONSE 
// {
//     "message": "Deleted successfully"
// }
//-------------------------------------------------------------------------------------------------------
//Fetches all blogs by a particular author (users mail) 
