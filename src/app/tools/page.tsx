'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FaGithub, FaCode, FaFileAlt, FaCopy, FaExternalLinkAlt, FaFilter, FaSpinner, FaSync, FaStar, FaExclamationTriangle } from 'react-icons/fa';

// Force dynamic rendering to prevent static prerendering
export const dynamic = 'force-dynamic';

interface Tool {
  id: string;
  name: string;
  description: string;
  link?: string;
  code?: string;
  type?: string;
  tags: string[];
}

const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  // Check for URL search parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  // Fetch tools data from API on component mount
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        // Load without forcing fresh GitHub data on initial load
        const response = await fetch(`/api/tools?source=all&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tools data');
        }
        const data = await response.json();
        // Handle both old array format and new structured format
        const toolsArray = Array.isArray(data) ? data : (data.tools || []);
        setTools(toolsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Filter tools based on search and tag filters
  useEffect(() => {
    let filtered = tools;

    // Filter by tag
    if (selectedTag !== 'All') {
      filtered = filtered.filter(tool => tool.tags.includes(selectedTag));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTools(filtered);
  }, [tools, selectedTag, searchTerm]);

const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set([...prev, itemId]));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };

  const getToolIcon = (tool: Tool) => {
    if (tool.type === 'payload' || tool.code) return <FaCode className="text-cyber-purple" />;
    if (tool.type === 'cheatsheet') return <FaFileAlt className="text-cyber-blue" />;
    return <FaGithub className="text-cyber-green" />;
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    if (Array.isArray(tools) && tools.length > 0) {
      tools.forEach(tool => {
        if (tool.tags && Array.isArray(tool.tags)) {
          tool.tags.forEach(tag => tags.add(tag));
        }
      });
    }
    return Array.from(tags).sort();
  };

  // Fetch latest tools from GitHub and external sources
  const fetchLatestTools = async () => {
    try {
      setRefreshing(true);
      setRefreshError(null);
      const response = await fetch(`/api/tools/latest?limit=20&fresh=true&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch latest tools');
      }
      const data = await response.json();
      const latestTools = data.tools || [];
      
      // Merge with existing tools (avoid duplicates)
      const existingIds = new Set(tools.map(tool => tool.id));
      const newTools = latestTools.filter((tool: Tool) => !existingIds.has(tool.id));
      
      if (newTools.length > 0) {
        setTools(prevTools => [...newTools, ...prevTools]);
      }
    } catch (err) {
      console.error('Error fetching latest tools:', err);
      setRefreshError('Failed to fetch latest tools. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch fresh GitHub tools
  const fetchFreshTools = async () => {
    try {
      setRefreshing(true);
      setRefreshError(null);
      const response = await fetch(`/api/tools?fresh=true&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fresh tools');
      }
      const data = await response.json();
      const toolsArray = Array.isArray(data) ? data : (data.tools || []);
      setTools(toolsArray);
    } catch (err) {
      console.error('Error fetching fresh tools:', err);
      setRefreshError('Failed to refresh tools. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch payloads
  const fetchPayloads = async () => {
    try {
      setRefreshing(true);
      setRefreshError(null);
      const response = await fetch(`/api/tools/payloads?fresh=true&limit=30&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payloads');
      }
      const data = await response.json();
      const payloads = data.payloads || [];
      
      // Convert payloads to tool format and merge
      const payloadTools = payloads.map((payload: any) => ({
        id: payload.id,
        name: payload.name,
        description: payload.description,
        code: payload.code,
        type: payload.type,
        tags: payload.tags,
        link: undefined
      }));
      
      const existingIds = new Set(tools.map(tool => tool.id));
      const newPayloads = payloadTools.filter((tool: Tool) => !existingIds.has(tool.id));
      
      if (newPayloads.length > 0) {
        setTools(prevTools => [...newPayloads, ...prevTools]);
      }
    } catch (err) {
      console.error('Error fetching payloads:', err);
      setRefreshError('Failed to fetch payloads. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-cyber font-bold glitch" data-text="Tools & Payloads Vault">
            Tools & Payloads Vault
          </h1>
          <p className="text-lg text-cyber-blue mt-4">
            [ Arsenal of exploitation tools and security resources ]
          </p>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <FaSpinner className="text-cyber-green text-4xl animate-spin mx-auto mb-4" />
            <p className="text-cyber-green text-lg">Loading tools...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg mb-8 text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters and Tools Grid */}
        {!loading && !error && (
          <>
            <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-terminal-bg border border-cyber-green/50 pl-4 pr-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none"
                  />
                </div>

                {/* Tag Filter */}
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-terminal-bg border border-cyber-green/50 px-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none [&>option]:text-white [&>option]:bg-gray-800"
                >
                  <option value="All">All Tags</option>
                  {getAllTags().map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTag('All');
                  }}
                  className="bg-cyber-green text-white px-4 py-2 rounded font-bold hover:bg-cyber-blue transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-card-bg border border-cyber-blue/30 p-4 rounded-lg mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={fetchLatestTools}
                  disabled={refreshing}
                  className="bg-cyber-blue text-white px-4 py-2 rounded font-bold hover:bg-cyber-green transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaStar />
                  <span>Fetch Latest Tools</span>
                </button>

                <button
                  onClick={fetchPayloads}
                  disabled={refreshing}
                  className="bg-cyber-pink text-white px-4 py-2 rounded font-bold hover:bg-cyber-purple transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaCode />
                  <span>Fetch Payloads</span>
                </button>

                <button
                  onClick={fetchFreshTools}
                  disabled={refreshing}
                  className="bg-cyber-purple text-white px-4 py-2 rounded font-bold hover:bg-cyber-pink transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaSync className={refreshing ? "animate-spin" : ""} />
                  <span>Refresh All Tools</span>
                </button>
              </div>
              {refreshing && (
                <div className="text-center mt-3">
                  <p className="text-cyber-blue text-sm">Fetching latest tools...</p>
                </div>
              )}
              {refreshError && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded mt-3 flex items-center justify-center space-x-2">
                  <FaExclamationTriangle className="text-red-400" />
                  <p className="text-red-400 text-sm">{refreshError}</p>
                  <button
                    onClick={() => setRefreshError(null)}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="bg-card-bg border border-cyber-green/30 rounded-lg p-6 hover:border-cyber-green transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getToolIcon(tool)}
                      <h3 className="text-lg font-bold text-cyber-green group-hover:text-cyber-blue transition-colors">
                        {tool.name}
                      </h3>
                    </div>
                    {tool.type && (
                      <span className="px-2 py-1 bg-cyber-purple/20 text-cyber-purple text-xs rounded border border-cyber-purple/30">
                        {tool.type}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-4">
                    {tool.description}
                  </p>

                  {/* Code Block (if present) */}
{tool.code && (
                    <div className="bg-terminal-bg border border-cyber-green/50 p-3 rounded mb-4 relative">
                      <pre className="text-cyber-green text-sm font-mono overflow-x-auto"><code>{tool.code}</code></pre>
                      <button
                        onClick={() => copyToClipboard(tool.code!, tool.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-cyber-green transition-colors"
                        title="Copy to clipboard"
                      >
                        <FaCopy size={14} />
                      </button>
                      {copiedItems.has(tool.id) && <span className="absolute top-2 right-10 text-cyber-green text-xs copy-status">Copied!</span>}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-cyber-green/10 text-cyber-green text-xs rounded border border-cyber-green/30 cursor-pointer hover:bg-cyber-green/20 transition-colors"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    {tool.link && (
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-cyber-green text-black px-4 py-2 rounded font-semibold hover:bg-cyber-blue transition-colors"
                      >
                        <FaExternalLinkAlt size={12} />
                        <span>View</span>
                      </a>
                    )}
                    {tool.code && (
                      <button
                        onClick={() => copyToClipboard(tool.code!, tool.id)}
                        className="flex items-center space-x-2 bg-cyber-purple text-white px-4 py-2 rounded font-semibold hover:bg-cyber-pink transition-colors"
                      >
                        <FaCopy size={12} />
                        <span>{copiedItems.has(tool.id) ? 'Copied!' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No tools found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Tools;
