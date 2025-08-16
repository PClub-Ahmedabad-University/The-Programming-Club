"use client";

import React, { useState } from 'react';
import { formatDistance } from "date-fns";
import dynamic from 'next/dynamic';
import { getToken, getUserIdFromToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const Tiptap = dynamic(() => import('@/components/Tiptap'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] max-w-[500px] bg-gray-900/50 rounded-lg border border-white/10 p-4">
      Loading editor...
    </div>
  ),
});

const CommentBox = ({ data, blogData, blogId, type, user, getComments }) => {
  const [hover, setHover] = useState(false);
  const [openBox, setOpenBox] = useState(false);
  const [commentData, setCommentData] = useState("");
  const [isUser, setUser] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const plainText = new DOMParser().parseFromString(commentData, 'text/html').body.textContent || "";
    const res = await fetch(`/api/blog/${blogId}/comments/add`, {
        method: "POST",
        body: JSON.stringify({
            userId: user.id,
            content: plainText,
            isAnonymys: blogData.isAnonymys,
            author: "test",
            parentCommentId: data._id,
        })
    });
    if(res) {
        setCommentData("");
        setOpenBox(false);
        await getComments();
    }
  }

  const handleClick = () => {
    const token = getToken();
    if (token) {
        const currentUserId = getUserIdFromToken(token);
        if (currentUserId) {
            setUser(true);
            setOpenBox(true);
        } else {
            console.error('Failed to get user info from token');
        }
    } else {
        console.error('No token found in localStorage');
        router.push("/users/login");
    }
  }

  return (
    <div
      className={`comment-box w-full flex items-start gap-4 font-inter overflow-x-auto
        ${type === "nested" ? "mt-4 mb-2 pl-6 border-l-[2px] border-gray-700 max-sm:pl-3" : "mt-3 mb-8"}`}
    >
      <div className="flex flex-col h-fit items-start">
        <div
          className={`circle ${
            type === "nested" ? "h-8 w-8 text-sm" : "h-12 w-12 text-base"
          } flex justify-center items-center bg-black text-white rounded-full font-bold relative max-sm:h-8 max-sm:w-8 max-sm:text-sm`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {data.userId.name[0]}
          {hover && (
            <div className="tooltip absolute bottom-[-30px] bg-gray-200 text-black px-2 py-1 text-xs rounded shadow-md whitespace-nowrap z-20">
              {data.userId.name}
            </div>
          )}
        </div>
      </div>

      <div className="box-right mt-[6px] text-[15px] leading-relaxed flex flex-col">
        <p className={`${type === "nested" ? "text-gray-300" : "text-white"}`}>
          {data.content}
        </p>
        <div className={`box-bottom flex items-center mt-1 gap-5 ${openBox && `mb-3`}`}>
            <p className='text-[14px] underline cursor-pointer' onClick={handleClick}>Reply</p>
            <p>
              {
                formatDistance(new Date(), data.createdAt)
                .replace("about","")
                .replace("hours", "hrs")
                .replace("minutes","min")
              }
            </p>
        </div>

        {/* Kept here to position it better */}
        {openBox && (
            <>
                <Tiptap
                    content={commentData} 
                    onChange={(val) => { setCommentData(val) }}
                />
                <div className="button-groups flex items-center gap-5 *:cursor-pointer  ">
                    <button onClick={handleSubmit} className='post-reply border mt-2 w-25 py-0.5'>Post</button>
                    <button className="cancel border mt-2 w-25 py-0.5" onClick={() => { setOpenBox(false); setCommentData(""); }}>Cancel</button>
                </div>
            </>
        )}

        {data.comments?.length > 0 && (
          <div className="nested-comments mt-3 space-y-2">
            {data.comments.map((nestedComment, index) => (
                <>
                    <CommentBox key={index} data={nestedComment} blogData={blogData} blogId={blogId} type="nested" user={user} getComments={getComments} />
                </>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentBox;