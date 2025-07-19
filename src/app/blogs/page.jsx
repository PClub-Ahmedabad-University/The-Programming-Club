"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiArrowRight, FiClock, FiUser, FiCalendar, FiTag, FiSearch, FiX, FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken } from '@/lib/auth';
import styles from '@/styles/BlogContent.module.css';
import Loader from "@/ui-components/Loader1";
import { getUserIdFromToken } from '@/lib/auth';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedBlogs, setLikedBlogs] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [userId, setUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState({});
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const token = getToken();
    if (token) {
      const currentUserId = getUserIdFromToken(token);
      if (currentUserId) {
        setUserId(currentUserId);
      } else {
        console.error('Failed to get user ID from token');
      }
    } else {
      console.error('No token found in localStorage');
    }
    fetchBlogs();
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

  // Filter blogs based on search query
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch = searchQuery === '' ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.author && blog.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (blog.tags && blog.tags.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      return matchesSearch;
    });
  }, [blogs, searchQuery]);

  // Sort blogs based on sort option
  const sortedAndFilteredBlogs = useMemo(() => {
    const blogsToSort = [...filteredBlogs];
    switch (sortOption) {
      case 'newest':
        return blogsToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return blogsToSort.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'most-liked':
        return blogsToSort.sort((a, b) => (likeCounts[b._id] || 0) - (likeCounts[a._id] || 0));
      default:
        return blogsToSort;
    }
  }, [filteredBlogs, sortOption, likeCounts]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      let currentUserId = null;

      if (token) {
        currentUserId = getUserIdFromToken(token);
        if (currentUserId && !userId) {
          setUserId(currentUserId);
        }
      }

      const response = await fetch('/api/blog', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      const blogData = await response.json();
      setBlogs(blogData);

      const counts = await fetchLikeCounts(blogData);
      setLikeCounts(counts);

      if (currentUserId) {
        const statuses = await fetchLikeStatuses(blogData, currentUserId);
        setLikedBlogs(statuses);
      } else {
        const initialStatuses = {};
        blogData.forEach(blog => {
          initialStatuses[blog._id] = false;
        });
        setLikedBlogs(initialStatuses);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchLikeCounts, fetchLikeStatuses]);

  const handleLike = async (blogId) => {
    if (!userId || isProcessing[blogId]) return;

    try {
      setIsProcessing(prev => ({ ...prev, [blogId]: true }));
      const isLiked = likedBlogs[blogId];

      setLikedBlogs(prev => ({
        ...prev,
        [blogId]: !isLiked
      }));

      const newLikeCount = isLiked
        ? Math.max(0, (likeCounts[blogId] || 0) - 1)
        : (likeCounts[blogId] || 0) + 1;

      setLikeCounts(prev => ({
        ...prev,
        [blogId]: newLikeCount
      }));

      const endpoint = isLiked
        ? `/api/like/${blogId}/${userId}/deleteLike`
        : `/api/like/${blogId}/${userId}/addLike`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        setLikedBlogs(prev => ({
          ...prev,
          [blogId]: isLiked
        }));

        setLikeCounts(prev => ({
          ...prev,
          [blogId]: isLiked
            ? newLikeCount + 1
            : Math.max(0, newLikeCount - 1)
        }));

        const error = await response.json();
        throw new Error(error.message || 'Failed to update like');
      }

      const [countRes, statusRes] = await Promise.all([
        fetch(`/api/like/${blogId}`, {
          cache: 'no-store',
          next: { revalidate: 0 }
        }),
        fetch(`/api/like/${blogId}/${userId}/check-like`, {
          cache: 'no-store',
          next: { revalidate: 0 }
        })
      ]);

      const [likes, statusData] = await Promise.all([
        countRes.json(),
        statusRes.json()
      ]);

      if (Array.isArray(likes)) {
        setLikeCounts(prev => ({
          ...prev,
          [blogId]: likes.length
        }));
      }

      if (statusData && typeof statusData.isLiked === 'boolean') {
        setLikedBlogs(prev => ({
          ...prev,
          [blogId]: statusData.isLiked
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [blogId]: false }));
    }
  };

  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-1">
        <Loader />
      </div>
    );
  }

  return (
    <div className="font-content min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto">
        <div className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 sm:mb-8"
            >
              <section className="relative pt-3 sm:pt-5 pb-8 sm:pb-12 px-2 sm:px-4 md:px-8 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider relative inline-block mb-3 sm:mb-4">
                  <span className="text-white font-heading relative z-10 border-2 sm:border-3 border-blue-400 rounded-lg px-4 sm:px-8 lg:px-12 py-2 sm:py-3 lg:py-4 text-4xl sm:text-4xl md:text-5xl lg:text-6xl">
                    Blog Posts
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-lg z-0 rounded-lg"></span>
                </h1>
              </section>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0 mb-8">
                Explore tutorials, articles, and user-submitted posts—where every member can write and share their knowledge.
              </p>
              <Link
                href="/blogs/add"
                className="inline-flex bg-gray-600 hover:bg-gray-700 items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-pclubPrimary hover:bg-pclubPrimary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pclubPrimary transition-colors"
              >
                <FiPlus className="mr-2 h-5 w-5" />
                Write a Blog Post
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-8 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
                Search Blogs
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pclubPrimary focus:border-transparent"
                  placeholder="Search by title, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-400 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                className="block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pclubPrimary focus:border-transparent"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-liked">Most Liked</option>
              </select>
            </div>
          </div>
          {searchQuery && (
            <div className="text-sm text-gray-400">
              Showing {sortedAndFilteredBlogs.length} {sortedAndFilteredBlogs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
          {sortedAndFilteredBlogs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FiSearch className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-300">No blogs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search or filter to find what you\'re looking for.'
                  : 'There are no blog posts available at the moment.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pclubPrimary hover:bg-pclubPrimary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pclubPrimary"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            sortedAndFilteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl hover:shadow-gray-500/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01]"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h2
                      className="text-2xl font-semibold text-white hover:text-pclubPrimary transition-colors leading-tight tracking-tight cursor-pointer"
                      onClick={() => openModal(blog)}
                    >
                      {blog.title}
                    </h2>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(blog._id);
                      }}
                      disabled={isProcessing[blog._id]}
                      className={`p-2 rounded-full transition-all ${likedBlogs[blog._id]
                        ? 'text-red-500 hover:bg-red-500/10'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        } ${isProcessing[blog._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={likedBlogs[blog._id] ? 'Unlike' : 'Like'}
                    >
                      <div className="flex items-center">
                        <FiHeart
                          className={`w-5 h-5 ${likedBlogs[blog._id] ? 'fill-current drop-shadow-md' : ''}`}
                        />
                        {likeCounts[blog._id] > 0 && (
                          <span className="ml-1 text-sm text-white">
                            {likeCounts[blog._id]}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="flex-grow">
                    <div className="relative">
                      <div
                        className={`${styles.blogContentPreview} text-gray-300 mb-4 line-clamp-3 tracking-wide`}
                        dangerouslySetInnerHTML={{ __html: blog.content || 'No description available' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-blue-500 bg-gradient-to-r from-pclubPrimary/30 to-pclubPrimary/10 text-pclubPrimary text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => openModal(blog)}
                      className="w-full text-white py-2 px-4 mb-4 text-pclubPrimary hover:bg-pclubPrimary/10 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 hover:underline"
                    >
                      Read Full Story <FiArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4 text-gray-500" />
                        <span>{blog.isAnonymous ? 'Anonymous' : blog.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4 text-gray-500" />
                        <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )))}
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No blog posts found. Check back later!</p>
          </div>
        )}

        {isModalOpen && selectedBlog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleBackdropClick}
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {selectedBlog.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        {selectedBlog.isAnonymous ? 'Anonymous' : selectedBlog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {format(new Date(selectedBlog.createdAt), 'MMMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {formatDistanceToNow(new Date(selectedBlog.createdAt), { addSuffix: true })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(selectedBlog._id);
                        }}
                        disabled={isProcessing[selectedBlog._id]}
                        className={`flex items-center gap-1 transition-colors ${likedBlogs[selectedBlog._id] ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                      >
                        <FiHeart className={`w-4 h-4 ${likedBlogs[selectedBlog._id] ? 'fill-current' : ''}`} />
                        {likeCounts[selectedBlog._id] || 0}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className={`${styles.prose} prose prose-invert max-w-none text-gray-300`}>
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  />
                </div>

                {selectedBlog.tags?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-800/80 text-blue-500 text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black/30 to-transparent">
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </div>
    </div>
  );
}