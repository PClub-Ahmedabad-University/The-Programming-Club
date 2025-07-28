"use client";

import React, { useEffect, useState } from 'react';
import { FaComments } from "react-icons/fa6";
import CommentBox from './commentbox';

const Comments = ({ blogId }) => {
    const [allComments, setAllComments] = useState([]);

    useEffect(() => {
        const getComments = async () => {
            try {
                const res = await fetch(`/api/blog/${blogId}/comments/get`);
                if(res.status != 200) {
                    console.error("Error fetching comments");
                    return;
                }
                const comments = await res.json();
                setAllComments(comments);
            } catch (error) {
                console.error("Error fetching comments", error);
            }
        }
        getComments();
    }, []);

    useEffect(() => {
        console.log(allComments);
    },[allComments]);

  return (
        <div className="comments-section w-full font-inter px-12 pb-5">
            <div className="section-top w-full flex justify-between items-center py-5">
                <div className="section-left flex items-center gap-5">
                    <FaComments size={45}/>
                    <h1 className='text-2xl font-bold'>Comments</h1>
                </div>
                <div className="section-right flex items-center">
                    Write a comment
                </div>
            </div>
            <div className="section-bottom w-full">
                {allComments.length == 0 ? (
                    <h1>No comments yet</h1>
                ) : (
                    allComments.map((comment,index) => (
                        <CommentBox key={index} data={comment} blogId={blogId} type="parent"/>
                    ))
                )}
            </div>
        </div>
  )
}

export default Comments