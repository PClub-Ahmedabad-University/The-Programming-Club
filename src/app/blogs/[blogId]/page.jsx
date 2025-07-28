'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiCalendar, FiClock, FiHeart, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import Link from 'next/link';
import { getToken, getUserIdFromToken, getUserRoleFromToken } from '@/lib/auth';
import styles from '@/styles/BlogContent.module.css';
import Loader1 from '@/ui-components/Loader1';
import Comments from './comments';

export default function BlogPost({ params }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState({ id: null, role: null });
  const router = useRouter();

  const { blogId } = use(params);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const currentUserId = getUserIdFromToken(token);
      const userRole = getUserRoleFromToken(token);

      if (currentUserId) {
        setUser({ id: currentUserId, role: userRole });
      } else {
        console.error('Failed to get user info from token');
      }
    } else {
      console.error('No token found in localStorage');
    }
  }, []);
  const fetchLikeCounts = useCallback(async (blogList) => {
    const counts = {};
    await Promise.all(
      blogList.map(async (blog) => {
        try {
          const res = await fetch(`/api/like/${blog._id}`);
          const likes = await res.json();
          counts[blog._id] = likes.length || 0;
        } catch (error) {
          console.error('Error fetching like count:', error);
          counts[blog._id] = 0;
        }
      })
    );
    return counts;
  }, []);

  const fetchLikeStatuses = useCallback(async (blogList, userId) => {
    const status = {};
    blogList.forEach(blog => {
      status[blog._id] = false;
    });

    try {
      for (const blog of blogList) {
        try {
          const res = await fetch(`/api/like/${blog._id}/${userId}/check-like`, {
            cache: 'no-store',
            next: { revalidate: 0 },
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          if (!res.ok) {
            console.error(`Failed to fetch like status for blog ${blog._id}:`, res.status);
            continue;
          }

          const data = await res.json();
          status[blog._id] = data?.isLiked === true;
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Error checking like status for blog ${blog._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in fetchLikeStatuses:', error);
    }

    return status;
  }, []);

  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blog/${blogId}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }

        const data = await response.json();
        setBlog(data);
        
        // First, fetch the like count
        const likeCountRes = await fetch(`/api/like/${blogId}`, { cache: 'no-store' });
        if (likeCountRes.ok) {
          const likes = await likeCountRes.json();
          setLikeCount(Array.isArray(likes) ? likes.length : 0);
        } else {
          setLikeCount(0);
        }

        const token = getToken();
        if (token) {
          const userId = getUserIdFromToken(token);
          if (userId) {
            setUser({
              id: userId,
              role: getUserRoleFromToken(token)
            });

            // Then check if the current user has liked the post
            const likeCheck = await fetch(`/api/like/${blogId}/${userId}/check-like`, {
              cache: 'no-store',
              next: { revalidate: 0 },
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            
            if (likeCheck.ok) {
              const likeData = await likeCheck.json();
              setLiked(!!likeData.isLiked);
            } else {
              setLiked(false);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const handleLike = async () => {
    if (!user?.id) {
      alert('Please log in to like posts');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Optimistic UI update
      const newLikedState = !liked;
      setLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

      const endpoint = newLikedState
        ? `/api/like/${blogId}/${user.id}/addLike`
        : `/api/like/${blogId}/${user.id}/deleteLike`;

      //   console.log('Calling endpoint:', endpoint); // Debug log
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
      });

      //   console.log('Like API response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Like API error:', errorData);
        throw new Error(errorData.message || 'Failed to update like');
      }

      // Refresh like count and status
      const [likeRes, statusRes] = await Promise.all([
        fetch(`/api/like/${blogId}`, { cache: 'no-store' }),
        fetch(`/api/like/${blogId}/${user.id}/check-like`, { cache: 'no-store' })
      ]);

      if (likeRes.ok) {
        const likes = await likeRes.json();
        // console.log('Updated like count:', likes.length); // Debug log
        setLikeCount(likes.length || 0);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        // console.log('Updated like status:', statusData.isLiked); // Debug log
        setLiked(!!statusData.isLiked);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setLiked(!liked);
      setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsProcessing(false);
    }
  };

  const canDeleteBlog = (blog) => {
    if (!blog) return false;
    const isAdmin = user?.role === 'admin';
    const isAuthor = blog.userId && user?.id && blog.userId.toString() === user.id;

    if (isAdmin) return true;
    if (blog.author === 'Programming Club') return false;
    return isAuthor;
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }

      router.push('/blogs');
      router.refresh();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert(error.message || 'Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader1 />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center px-4">
        <div className="text-red-500 text-lg mb-6">{error}</div>
        <Link
          href="/blogs"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center px-4">
        <div className="text-gray-400 text-lg mb-6">Blog post not found</div>
        <Link
          href="/blogs"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-300 relative">
      {/* Back Button */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-300 text-lg group"
        >
          <FiArrowLeft className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          Back to Blogs
        </button>
      </div>

      {/* Blog Content */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border-t border-b border-white/10">
          {/* Header */}
          <div className="p-6 sm:p-8 lg:p-12 border-b border-white/10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-gray-400">
              <span className="flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                {blog.isAnonymous ? 'Anonymous' : blog.author}
              </span>
              <span className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                {blog?.createdAt ? format(new Date(blog.createdAt), 'MMMM d, yyyy') : 'Unknown date'}
              </span>
              <span className="flex items-center gap-2">
                <FiClock className="w-5 h-5" />
                {blog?.createdAt ? formatDistanceToNow(parseISO(blog.createdAt), { addSuffix: true }) : 'recently'}
              </span>
              <button
                onClick={handleLike}
                disabled={isProcessing}
                className={`flex items-center gap-2 transition-colors duration-300 ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
              >
                <FiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>
            </div>
            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mt-6">
                {/* <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Tags
                </h3> */}
                <div className="flex flex-wrap gap-3">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gray-800/80 text-blue-400 text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-full shadow-sm hover:bg-gray-700/80 transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            <div className={`${styles.prose} prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed`}>
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </div>

          {/* Footer */}
          {canDeleteBlog(blog) && (
            <div className="p-6 border-t border-white/10 bg-gradient-to-t from-black/20 to-black/">
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center transition-colors duration-300 mx-auto"
              >
                Delete Post
                <FiTrash2 className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <Comments blogData={blog} blogId={blogId} user={user}/>
    </div>
  );
}