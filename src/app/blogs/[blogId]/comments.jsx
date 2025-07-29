"use client";

import React, { useEffect, useState } from 'react';
import { FaComments } from "react-icons/fa6";
import CommentBox from './commentbox';
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

const Comments = ({ blogData, blogId, user }) => {
    const [allComments, setAllComments] = useState([]);
    const [openBox, setOpenBox] = useState(false);
    const [commentData, setCommentData] = useState("");
    const [loading, setLoading] = useState(true);
    const [isUser, setUser] = useState(false);
    const router = useRouter();

    const getComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/blog/${blogId}/comments/get`);
            if(res.status != 200) {
                console.error("Error fetching comments");
                return;
            }
            const comments = await res.json();
            setAllComments(comments);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching comments", error);
        }
    };

    useEffect(() => {
        getComments();
    },[]);

    const handleSubmit = async () => {
        const plainText = new DOMParser().parseFromString(commentData, 'text/html').body.textContent || "";
        const res = await fetch(`/api/blog/${blogId}/comments/add`, {
            method: "POST",
            body: JSON.stringify({
                userId: user.id,
                content: plainText,
                isAnonymys: blogData.isAnonymys,
                author: "test",
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
        <div className="comments-section w-full font-inter px-12 pb-5 max-sm:px-5">
            <div className="section-top w-full flex justify-between items-center py-5">
                <div className="section-left flex items-center gap-5 max-sm:gap-3">
                    <FaComments size={45} className='max-sm:h-8 max-sm:w-8'/>
                    <h1 className='text-2xl font-bold max-sm:text-xl'>Comments</h1>
                </div>
                <div className="section-right flex items-center cursor-pointer hover:underline max-sm:text-sm" onClick={handleClick}>
                    Write a comment
                </div>
            </div>
            {openBox && (
                <>
                    <Tiptap
                        content={commentData} 
                        onChange={(val) => { setCommentData(val) }}
                    />
                    <div className="button-groups flex items-center gap-5 *:cursor-pointer">
                        <button onClick={handleSubmit} className='post-reply border mt-2 w-25 py-0.5'>Post</button>
                        <button className="cancel border mt-2 w-25 py-0.5" onClick={() => setOpenBox(false)}>Cancel</button>
                    </div>
                </>
            )}
            <div className="section-bottom w-full">
                {loading ? (
                    <div className="box w-2/4 flex gap-3 mb-5">
                        <div className="circle h-12 w-12 rounded-full bg-black flex justify-center items-center animate-pulse mt-1.5">L</div>
                        <div className="content w-2/4 h-15 bg-gradient-to-r from-gray-700/80 to-gray-800/80 rounded-lg animate-pulse"></div>
                    </div>
                ) : (
                    allComments.length == 0 ? (
                        <h1>No comments yet</h1>
                    ) : (
                        allComments.map((comment,index) => (
                            <CommentBox key={index} data={comment} blogData={blogData} blogId={blogId} user={user} getComments={getComments} type="parent"/>
                        ))
                    )
                )}
            </div>
        </div>
  )
}

export default Comments