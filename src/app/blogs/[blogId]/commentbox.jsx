"use client";

import React, { useState } from 'react';
import { formatDistance } from "date-fns";
import dynamic from 'next/dynamic';
import { POST } from '@/app/api/forms/route';

const Tiptap = dynamic(() => import('@/components/Tiptap'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] max-w-[500px] bg-gray-900/50 rounded-lg border border-white/10 p-4">
      Loading editor...
    </div>
  ),
});

const CommentBox = ({ data, blogId, type }) => {
  const [hover, setHover] = useState(false);
  const [openBox, setOpenBox] = useState(false);
  const [commentData, setCommentData] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(`/api/blog/${blogId}/comments/add`, {
    });
  }

  return (
    <div
      className={`comment-box w-full flex items-start gap-4 font-inter 
        ${type === "nested" ? "mt-4 mb-2 pl-6 border-l-[2px] border-gray-700" : "mt-6 mb-8"}`}
    >
      <div className="flex flex-col h-fit items-start">
        <div
          className={`circle ${
            type === "nested" ? "h-8 w-8 text-sm" : "h-12 w-12 text-base"
          } flex justify-center items-center bg-black text-white rounded-full font-bold relative`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {data.userId.name[0]}
          {hover && (
            <div className="tooltip absolute bottom-[-30px] bg-gray-200 text-black px-2 py-1 text-xs rounded shadow-md whitespace-nowrap z-10">
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
            <p className='text-[14px] underline cursor-pointer' onClick={() => setOpenBox(true)}>Reply</p>
            <p>{formatDistance(new Date(), data.createdAt)}</p>
        </div>

        {/* Kept here to position it better */}
        {openBox && (
            <>
                <Tiptap
                    content={commentData} 
                    onChange={(val) => { setCommentData(val); console.log(val); }}
                />
                <div className="button-groups flex items-center gap-5">
                    <button onClick={handleSubmit} className='post-reply border mt-2 w-25 py-0.5'>Post</button>
                    <button className="cancel border mt-2 w-25 py-0.5" onClick={() => setOpenBox(false)}>Cancel</button>
                </div>
            </>
        )}

        {data.comments?.length > 0 && (
          <div className="nested-comments mt-3 space-y-2">
            {data.comments.map((nestedComment, index) => (
                <>
                    <CommentBox key={index} data={nestedComment} type="nested" />
                </>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentBox;