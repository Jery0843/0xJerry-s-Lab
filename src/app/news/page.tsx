'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FaRss, FaReddit, FaStackOverflow, FaShieldAlt, FaExclamationTriangle, FaExternalLinkAlt, FaNewspaper, FaSync, FaClock } from 'react-icons/fa';

interface NewsItem {
  title: string;
  link: string;
  summary: string;
  timestamp: string;
  source: string;
  tags: string[];
}

interface CVEItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  score: number;
  publishedDate: string;
  lastModified: string;
  references: string[];
  affectedProducts: string[];
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [cves, setCves] = useState<CVEItem[]>([]);
  const [allCves, setAllCves] = useState<CVEItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingCVEs, setRefreshingCVEs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('news');
  const [lastCVEUpdate, setLastCVEUpdate] = useState<string>('');
  const [lastNewsUpdate, setLastNewsUpdate] = useState<string>('');
  const [refreshingNews, setRefreshingNews] = useState(false);

  // Check for URL search parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  // Cache management
  const CACHE_DURATION = {
    NEWS: 15 * 60 * 1000, // 15 minutes
    CVES: 30 * 60 * 1000, // 30 minutes
  };

  const getCachedData = (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        return { data, timestamp };
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  const isDataStale = (timestamp: number, maxAge: number) => {
    return Date.now() - timestamp > maxAge;
  };

  // Fetch news data with caching
  useEffect(() => {
    const fetchNews = async (forceRefresh = false) => {
      try {
        // Check cache first
        if (!forceRefresh) {
          const cached = getCachedData('news_data');
          if (cached && !isDataStale(cached.timestamp, CACHE_DURATION.NEWS)) {
            setAllNews(cached.data);
            setNews(cached.data);
            setLastNewsUpdate(new Date(cached.timestamp).toLocaleTimeString());
            return;
          }
        }

        // Fetch fresh data with cache busting
        const response = await fetch(`/api/news?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        setAllNews(data);
        setNews(data);
        setCachedData('news_data', data);
        setLastNewsUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Failed to fetch news:", error);
        // Try to load from cache as fallback
        const cached = getCachedData('news_data');
        if (cached) {
          setAllNews(cached.data);
          setNews(cached.data);
          setLastNewsUpdate(new Date(cached.timestamp).toLocaleTimeString());
        }
      }
    };

    const fetchCVEs = async (forceRefresh = false) => {
      try {
        // Check cache first
        if (!forceRefresh) {
          const cached = getCachedData('cve_data');
          if (cached && !isDataStale(cached.timestamp, CACHE_DURATION.CVES)) {
            setAllCves(cached.data);
            setCves(cached.data);
            setLastCVEUpdate(new Date(cached.timestamp).toLocaleTimeString());
            return;
          }
        }

        // Fetch fresh data with cache busting
        const response = await fetch(`/api/cve?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        setAllCves(data);
        setCves(data);
        setCachedData('cve_data', data);
        setLastCVEUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Failed to fetch CVEs:", error);
        // Try to load from cache as fallback
        const cached = getCachedData('cve_data');
        if (cached) {
          setAllCves(cached.data);
          setCves(cached.data);
          setLastCVEUpdate(new Date(cached.timestamp).toLocaleTimeString());
        }
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchNews(), fetchCVEs()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Filter data based on search term and active tab
  useEffect(() => {
    if (activeTab === 'news') {
      if (searchTerm && allNews.length > 0) {
        const filtered = allNews.filter((item: NewsItem) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.source.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setNews(filtered);
      } else {
        setNews(allNews);
      }
    } else if (activeTab === 'cves') {
      if (searchTerm && allCves.length > 0) {
        const filtered = allCves.filter((item: CVEItem) =>
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.severity.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setCves(filtered);
      } else {
        setCves(allCves);
      }
    }
  }, [searchTerm, allNews, allCves, activeTab]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-500 border-red-500';
      case 'HIGH':
        return 'text-orange-500 border-orange-500';
      case 'MEDIUM':
        return 'text-yellow-500 border-yellow-500';
      case 'LOW':
        return 'text-green-500 border-green-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const refreshNews = async () => {
    setRefreshingNews(true);
    try {
      const response = await fetch(`/api/news?fresh=true&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setAllNews(data);
      setNews(data);
      setCachedData('news_data', data);
      setLastNewsUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to refresh news:", error);
    } finally {
      setRefreshingNews(false);
    }
  };

  const refreshCVEs = async () => {
    setRefreshingCVEs(true);
    try {
      const response = await fetch(`/api/cve?fresh=true&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setAllCves(data);
      setCves(data);
      setCachedData('cve_data', data);
      setLastCVEUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to refresh CVEs:", error);
    } finally {
      setRefreshingCVEs(false);
    }
  };

  return (
    <Layout>
      <div className="py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-cyber font-bold glitch" data-text="Cyber Intelligence Feed">
            Cyber Intelligence Feed
          </h1>
          <p className="text-lg text-cyber-blue mt-4">
            [ Real-time security news and vulnerability intelligence ]
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-card-bg border border-cyber-green/30 rounded-lg p-2 flex space-x-2">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md font-bold transition-colors ${
                activeTab === 'news' ? 'bg-cyber-green text-white' : 'text-cyber-green hover:bg-cyber-green/20'
              }`}
            >
              <FaNewspaper />
              <span>News</span>
              {activeTab === 'news' && lastNewsUpdate && (
                <span className="text-xs opacity-75">({lastNewsUpdate})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cves')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md font-bold transition-colors ${
                activeTab === 'cves' ? 'bg-cyber-pink text-white' : 'text-cyber-pink hover:bg-cyber-pink/20'
              }`}
            >
              <FaShieldAlt />
              <span>CVEs</span>
              {activeTab === 'cves' && lastCVEUpdate && (
                <span className="text-xs opacity-75">({lastCVEUpdate})</span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={activeTab === 'news' ? 'Search news articles...' : 'Search CVEs...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-terminal-bg border border-cyber-green/50 px-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none"
            />
            <button
              onClick={activeTab === 'news' ? refreshNews : refreshCVEs}
              disabled={activeTab === 'news' ? refreshingNews : refreshingCVEs}
              className={`${activeTab === 'news' ? 'bg-cyber-green' : 'bg-cyber-pink'} text-white px-4 py-2 rounded font-bold hover:${activeTab === 'news' ? 'bg-cyber-blue' : 'bg-cyber-purple'} transition-colors disabled:opacity-50 flex items-center space-x-2`}
              title={`Refresh ${activeTab === 'news' ? 'news' : 'CVE'} data`}
            >
              <FaSync className={(activeTab === 'news' ? refreshingNews : refreshingCVEs) ? 'animate-spin' : ''} />
              {(activeTab === 'news' ? refreshingNews : refreshingCVEs) && <span className="text-xs">Updating...</span>}
            </button>
          </div>
          
          {searchTerm && (
            <p className="text-sm text-cyber-blue mt-2 text-center">
              Found {activeTab === 'news' ? news.length : cves.length} {activeTab === 'news' ? 'articles' : 'CVEs'} matching &quot;{searchTerm}&quot;
            </p>
          )}
          
          <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-gray-400">
            <FaClock />
            <span>
              {activeTab === 'cves' 
                ? 'Showing CVEs from the last 30 days' 
                : `News cached for ${Math.floor(CACHE_DURATION.NEWS / 60000)} minutes`
              }
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-xl animate-pulse">Loading {activeTab === 'news' ? 'news feed' : 'CVE database'}...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'news' ? (
              news.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-card-bg border border-cyber-green/30 rounded-lg p-6 hover:border-cyber-blue transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-cyber-green">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.title}
                      </a>
                    </h2>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{item.timestamp}</span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-4">
                    {item.summary}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-cyber-blue/10 text-cyber-blue text-xs rounded border border-cyber-blue/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {item.source === 'The Hacker News' && <FaRss className="text-orange-500" />}
                      {item.source === 'Krebs on Security' && <FaRss className="text-blue-400" />}
                      <span>{item.source}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              cves.map((cve, index) => (
                <div 
                  key={cve.id} 
                  className="bg-card-bg border border-cyber-green/30 rounded-lg p-6 hover:border-cyber-pink transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <FaExclamationTriangle className={`text-xl ${getSeverityColor(cve.severity).split(' ')[0]}`} />
                      <div>
                        <h2 className="text-xl font-bold text-cyber-pink">{cve.id}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded border ${getSeverityColor(cve.severity)}`}>
                            {cve.severity}
                          </span>
                          <span className="text-sm text-gray-400">Score: {cve.score}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(cve.publishedDate)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-4 line-clamp-3">
                    {cve.description}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                      {cve.affectedProducts.slice(0, 3).map((product, i) => (
                        <span key={i} className="bg-gray-800 px-2 py-1 rounded">
                          {product.split(':')[3] || product}
                        </span>
                      ))}
                      {cve.affectedProducts.length > 3 && (
                        <span className="text-gray-400">+{cve.affectedProducts.length - 3} more</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {cve.references.length > 0 && (
                        <a 
                          href={cve.references[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-cyber-blue hover:text-cyber-green transition-colors"
                        >
                          <FaExternalLinkAlt size={12} />
                          <span className="text-sm">Details</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {((activeTab === 'news' && news.length === 0) || (activeTab === 'cves' && cves.length === 0)) && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No {activeTab === 'news' ? 'news articles' : 'CVEs'} found{searchTerm ? ` matching "${searchTerm}"` : ''}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default News;
