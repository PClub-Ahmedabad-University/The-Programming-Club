"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken,getUserRoleFromToken } from '@/lib/auth';
import { FiUser, FiLock, FiGlobe, FiTag, FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { moderateBlogPost } from './ModerateBlogPost';
import { toast } from 'react-toastify';


// Dynamically import Tiptap to avoid SSR issues
const Tiptap = dynamic(() => import('@/components/Tiptap'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] bg-gray-900/50 rounded-lg border border-white/10 p-4">
      Loading editor...
    </div>
  ),
});

export default function AddBlog({ onBack, onPublish }) {
  const router = useRouter();
  const [moderationError, setModerationError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '<p>Start writing your blog post here...</p>',
    tags: [],
    isAnonymous: true,
    postAsClub: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const [role,setRole] = useState('user');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
          setRole(getUserRoleFromToken(token));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim().toLowerCase()) && formData.tags.length < 5) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim().toLowerCase()]
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Check if content is just the default or empty
    const isEmptyContent = !formData.content || 
                         formData.content === '<p>Start writing your blog post here...</p>' ||
                         formData.content.trim() === '<p></p>';
    
    if (!formData.title.trim() || isEmptyContent) {
      setError('Title and content are required');
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to post a blog');
      }
      
      const moderationResult = await moderateBlogPost({
        title: formData.title,
        content: formData.content,
        tags: formData.tags
      });
      
      if (moderationResult.flagged) {
        setModerationError(`Content not allowed: ${moderationResult.reason}`);
        return;
      }
      setModerationError(''); // Clear any previous errors

      let authorName;
      if (formData.isAnonymous) {
        authorName = 'Anonymous';
      } else if (formData.postAsClub) {
        authorName = 'The Programming Club';
      } else {
        authorName = `${userData?.name} (${userData?.email})`;
      }

      const blogData = {
        ...formData,
        userId: userData?._id,
        author: authorName
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create blog post');
      }

      setSuccess('Blog post created successfully!');
      setFormData({
        title: '',
        content: '',
        tags: [],
        isAnonymous: true,
        postAsClub: false
      });
      
      // Redirect to blogs page after 1.5 seconds
      setTimeout(() => {
        router.push('/blogs');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {moderationError && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{moderationError}</span>
            </div>
          </div>
        )}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
          >
            <FiArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Create New Blog Post</h1>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
              {success} Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pclubPrimary focus:border-transparent transition-all"
                placeholder="Enter blog title"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Content 
              </label>
              <Tiptap 
                content={formData.content} 
                onChange={(content) => setFormData(prev => ({ ...prev, content }))} 
              />
              {!formData.content && (
                <p className="mt-1 text-sm text-red-400">Content is required</p>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags (Press Enter to add, max 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pclubPrimary/20 text-pclubPrimary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-pclubPrimary/70 hover:text-pclubPrimary"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pclubPrimary focus:border-transparent transition-all"
                placeholder="Add tags (e.g., programming, javascript, webdev)"
                maxLength={20}
                disabled={formData.tags.length >= 5}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.tags.length}/5 tags added
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="isAnonymous"
                    name="isAnonymous"
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Reset postAsClub when toggling anonymous
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, postAsClub: false }));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-pclubPrimary focus:ring-pclubPrimary"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isAnonymous" className="font-medium text-gray-300">
                    Post Anonymously (Your name will not be shown on this post but the Pclub can still see it.)
                  </label>
                  <p className="text-gray-500 text-xs">
                    {formData.isAnonymous 
                      ? 'Your name will not be shown on this post but the Pclub can still see it.' 
                      : `Posting as ${formData.postAsClub ? 'The Programming Club' : `${userData?.name} (${userData?.email})`}`}
                  </p>
                </div>
              </div>

              {!formData.isAnonymous && role === 'admin' && (
                <div className="flex items-center ml-7">
                  <div className="flex items-center h-5">
                    <input
                      id="postAsClub"
                      name="postAsClub"
                      type="checkbox"
                      checked={formData.postAsClub}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-pclubPrimary focus:ring-pclubPrimary"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="postAsClub" className="font-medium text-gray-300">
                      Post as The Programming Club
                    </label>
                    <p className="text-gray-500 text-xs">
                      This will show "The Programming Club" as the author instead of your name
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pclubPrimary hover:bg-pclubPrimary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pclubPrimary transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Publishing...' : 'Publish Blog Post'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
