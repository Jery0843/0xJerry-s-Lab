'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FaReddit, FaStackOverflow, FaArrowUp, FaCommentAlt } from 'react-icons/fa';

interface ForumPost {
  title: string;
  link: string;
  upvotes: number;
  comments: number;
  source: string;
}

const Forums = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [allPosts, setAllPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reddit');
  const [searchTerm, setSearchTerm] = useState('');

  // Check for URL search parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  // Fetch posts data
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/forums?source=${activeTab}&fresh=true&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        setAllPosts(data);
        setPosts(data);
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} posts:`, error);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [activeTab]);

  // Filter posts based on search term
  useEffect(() => {
    if (searchTerm && allPosts.length > 0) {
      const filtered = allPosts.filter((post: ForumPost) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPosts(filtered);
    } else {
      setPosts(allPosts);
    }
  }, [searchTerm, allPosts]);

  const renderPost = (post: ForumPost, index: number) => (
    <div 
      key={index} 
      className="bg-card-bg border border-cyber-green/30 rounded-lg p-6 hover:border-cyber-blue transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <h2 className="text-lg font-bold text-cyber-green mb-2">
        <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {post.title}
        </a>
      </h2>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FaArrowUp className="text-orange-500" />
            <span>{post.upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaCommentAlt className="text-blue-400" />
            <span>{post.comments}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.source === 'Reddit' && <FaReddit className="text-orange-600" />}
          {post.source === 'Stack Overflow' && <FaStackOverflow className="text-orange-500" />}
          <span>{post.source}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-cyber font-bold glitch" data-text="Forum Feeds">
            Forum Feeds
          </h1>
          <p className="text-lg text-cyber-blue mt-4">
            [ Real-time discussions from the community ]
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="bg-card-bg border border-cyber-green/30 rounded-lg p-2 flex space-x-2">
            <button
              onClick={() => setActiveTab('reddit')}
              className={`px-6 py-2 rounded-md font-bold transition-colors ${
                activeTab === 'reddit' ? 'bg-cyber-green text-white' : 'text-cyber-green hover:bg-cyber-green/20'
              }`}
            >
              Reddit
            </button>
            <button
              onClick={() => setActiveTab('stackoverflow')}
              className={`px-6 py-2 rounded-md font-bold transition-colors ${
                activeTab === 'stackoverflow' ? 'bg-cyber-green text-white' : 'text-cyber-green hover:bg-cyber-green/20'
              }`}
            >
              Stack Overflow
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search forum posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-terminal-bg border border-cyber-green/50 px-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none"
          />
          {searchTerm && (
            <p className="text-sm text-cyber-blue mt-2 text-center">
              Found {posts.length} posts matching &quot;{searchTerm}&quot;
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-xl animate-pulse">Loading feed from {activeTab}...</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {posts.map(renderPost)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Forums;
