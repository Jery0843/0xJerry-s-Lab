'use client';

export const dynamic = 'force-dynamic';

import Layout from '@/components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaSkull, FaCode, FaBug, FaShieldAlt, FaTerminal, FaEdit, FaSave, FaTimes, FaCog } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import machinesData from '@/data/machines.json';

interface Tool {
  id: string;
  name: string;
  description: string;
  link?: string;
  tags: string[];
  stars?: number;
  language?: string;
}

interface Machine {
  id: string;
  name: string;
  os: string;
  difficulty: string;
  status: string;
  dateCompleted: string | null;
  tags: string[];
  writeup: string | null;
}

interface HTBStats {
  machinesPwned: number;
  globalRanking: number;
  finalScore: number;
  htbRank: string;
  lastUpdated: string;
}

export default function Home() {
  const [displayText, setDisplayText] = useState('');
  const [, setMachines] = useState<Machine[]>([]);
  const [latestMachines, setLatestMachines] = useState<Machine[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [htbStats, setHtbStats] = useState<HTBStats>({
    machinesPwned: 127,
    globalRanking: 15420,
    finalScore: 890,
    htbRank: 'Hacker',
    lastUpdated: new Date().toISOString()
  });
  const [adminMode, setAdminMode] = useState(false);

  // Check for admin session from new authentication system
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/auth');
        const data = await response.json();
        setAdminMode(data.authenticated || false);
      } catch (error) {
        console.error('Error checking admin session:', error);
        setAdminMode(false);
      }
    };
    
    checkAdminSession();
    
    // Listen for admin mode changes from header
    const handleAdminModeChange = () => {
      checkAdminSession();
    };
    
    window.addEventListener('adminModeChanged', handleAdminModeChange);
    
    return () => {
      window.removeEventListener('adminModeChanged', handleAdminModeChange);
    };
  }, []);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<HTBStats>(htbStats);
  const [saveMessage, setSaveMessage] = useState('');

const fullText = "Chasing root one box at a time — crafting exploits, decoding patterns, and breathing life into logic. This is the digital dojo where exploits evolve into mastery.";

  const [randomChars, setRandomChars] = useState<string[]>(Array(20).fill(''));

  useEffect(() => {
    setRandomChars(Array.from({ length: 20 }, () => String.fromCharCode(65 + Math.random() * 26)));
  }, []);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch tools from API with caching
  useEffect(() => {
    const fetchTools = async () => {
      try {
        // Check cache first (15 minutes)
        const cached = localStorage.getItem('homepage_tools');
        const cacheTimestamp = localStorage.getItem('homepage_tools_timestamp');
        const now = Date.now();
        const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
        
        if (cached && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
          // Use cached data
          const cachedTools = JSON.parse(cached);
          setTools(cachedTools);
          return;
        }
        
        // Fetch fresh data (without forcing GitHub API calls)
        const response = await fetch('/api/tools?source=all');
        const data = await response.json();
        const toolsArray = Array.isArray(data) ? data : (data.tools || []);
        
        // Sort by last updated date to get truly "latest" tools
        const sortedTools = toolsArray
          .filter((tool: any) => tool.lastUpdated)
          .sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
          .slice(0, 3);
        
        // Fallback to first 3 if no lastUpdated data
        const latestTools = sortedTools.length > 0 ? sortedTools : toolsArray.slice(0, 3);
        
        setTools(latestTools);
        
        // Cache the results
        localStorage.setItem('homepage_tools', JSON.stringify(latestTools));
        localStorage.setItem('homepage_tools_timestamp', now.toString());
      } catch (error) {
        console.error('Error fetching tools:', error);
        // Try to use cached data even if expired
        const cached = localStorage.getItem('homepage_tools');
        if (cached) {
          try {
            setTools(JSON.parse(cached));
          } catch (parseError) {
            console.error('Error parsing cached tools:', parseError);
          }
        }
      }
    };

    fetchTools();
  }, []);

  // Fetch HTB profile stats from D1 database
  useEffect(() => {
    const fetchHTBStats = async () => {
      try {
        // Try D1 API first
        const response = await fetch('/api/admin/htb-stats-d1');
        if (response.ok) {
          const data = await response.json();
          // Convert D1 format to component format
          const statsData = {
            machinesPwned: data.machines_pwned || data.machinesPwned || 127,
            globalRanking: data.global_ranking || data.globalRanking || 15420,
            finalScore: data.final_score || data.finalScore || 890,
            htbRank: data.htb_rank || data.htbRank || 'Hacker',
            lastUpdated: data.last_updated || data.lastUpdated || new Date().toISOString()
          };
          setHtbStats(statsData);
        } else {
          // Fallback to original API
          const fallbackResponse = await fetch('/api/htb-profile');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setHtbStats(fallbackData);
          }
        }
      } catch (error) {
        console.error('Error fetching HTB stats:', error);
        // Keep default stats if both APIs fail
      }
    };

    fetchHTBStats();
    
    // Refresh HTB stats every 5 minutes
    const interval = setInterval(fetchHTBStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load machines and get latest completed ones
  useEffect(() => {
    const loadMachines = () => {
      const savedMachines = localStorage.getItem('htb-machines');
      let machinesList: Machine[] = [];
      
      if (savedMachines) {
        try {
          machinesList = JSON.parse(savedMachines);
        } catch (error) {
          console.error('Error parsing saved machines:', error);
          machinesList = machinesData;
        }
      } else {
        machinesList = machinesData;
      }
      
      setMachines(machinesList);
      
      // Get latest 3 completed machines sorted by completion date
      const completedMachines = machinesList
        .filter(machine => machine.status === 'Completed' && machine.dateCompleted)
        .sort((a, b) => {
          if (!a.dateCompleted || !b.dateCompleted) return 0;
          return new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime();
        })
        .slice(0, 3);
      
      setLatestMachines(completedMachines);
    };

    loadMachines();
    
    // Listen for storage changes to update when machines are modified
    const handleStorageChange = () => {
      loadMachines();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for updates
    const interval = setInterval(loadMachines, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'border-cyber-green';
      case 'medium':
        return 'border-cyber-blue';
      case 'hard':
        return 'border-cyber-pink';
      default:
        return 'border-cyber-purple';
    }
  };

  // Admin functions
  const handleEditField = (field: string) => {
    setEditingField(field);
    setEditValues(htbStats);
  };

  const handleSaveField = async (field: string) => {
    try {
      const updatedStats = {
        ...htbStats,
        [field]: editValues[field as keyof HTBStats],
        lastUpdated: new Date().toISOString()
      };

      // Try D1 API first
      const response = await fetch('/api/admin/htb-stats-d1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session authentication
        body: JSON.stringify({
          machines_pwned: updatedStats.machinesPwned,
          global_ranking: updatedStats.globalRanking,
          final_score: updatedStats.finalScore,
          htb_rank: updatedStats.htbRank,
          last_updated: updatedStats.lastUpdated
        }),
      });

      if (response.ok) {
        setHtbStats(updatedStats);
        setSaveMessage('✅ Saved to database successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        // Fallback to original API
        const fallbackResponse = await fetch('/api/admin/htb-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedStats),
        });
        
        if (fallbackResponse.ok) {
          setHtbStats(updatedStats);
          setSaveMessage('✅ Saved to fallback storage!');
          setTimeout(() => setSaveMessage(''), 3000);
        } else {
          setSaveMessage('❌ Error saving to both database and fallback');
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveMessage('❌ Error saving');
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues(htbStats);
  };

  const handleEditValueChange = (field: keyof HTBStats, value: string | number) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render editable field
  const renderEditableField = (field: keyof HTBStats, value: string | number, displayValue: string) => {
    if (editingField === field) {
      if (field === 'htbRank') {
        return (
          <div className="flex items-center space-x-2">
            <select
              value={editValues[field] as string}
              onChange={(e) => handleEditValueChange(field, e.target.value)}
              className="text-2xl font-bold text-cyber-blue bg-gray-800 border border-cyber-green rounded px-2"
            >
              <option value="Noob">Noob</option>
              <option value="Script Kiddie">Script Kiddie</option>
              <option value="Hacker">Hacker</option>
              <option value="Pro Hacker">Pro Hacker</option>
              <option value="Elite Hacker">Elite Hacker</option>
              <option value="Guru">Guru</option>
              <option value="Omniscient">Omniscient</option>
            </select>
            <button onClick={() => handleSaveField(field)} className="text-cyber-green hover:text-cyber-green/80">
              <FaSave />
            </button>
            <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300">
              <FaTimes />
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={editValues[field] as number}
              onChange={(e) => handleEditValueChange(field, parseInt(e.target.value) || 0)}
              className="text-2xl font-bold text-cyber-blue bg-gray-800 border border-cyber-green rounded px-2 w-32"
            />
            <button onClick={() => handleSaveField(field)} className="text-cyber-green hover:text-cyber-green/80">
              <FaSave />
            </button>
            <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300">
              <FaTimes />
            </button>
          </div>
        );
      }
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-cyber-blue">{displayValue}</span>
        {adminMode && (
          <button
            onClick={() => handleEditField(field)}
            className="text-cyber-green hover:text-cyber-green/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaEdit />
          </button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="text-center py-20 relative">
        <div className="absolute inset-0 opacity-10">
<div className="matrix-rain text-matrix-green text-xl font-mono">
            {randomChars.map((char, i) => (
              <div key={i} className="animate-matrix-rain" style={{ animationDelay: `${i * 0.5}s` }}>
                {char}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-cyber font-black mb-6">
            <span className="glitch" data-text="0xJerry">
              0xJerry
            </span>
          </h1>
          
          <div className="text-xl md:text-2xl mb-8 h-16">
            <span className="terminal-cursor">{displayText}</span>
          </div>
          
          <div className="flex justify-center space-x-8 mb-12">
            <div className="flex items-center space-x-2 text-cyber-blue">
              <FaSkull className="animate-pulse" />
              <span>Penetration Testing</span>
            </div>
            <div className="flex items-center space-x-2 text-cyber-purple">
              <FaBug className="animate-pulse" />
              <span>Bug Hunting</span>
            </div>
            <div className="flex items-center space-x-2 text-cyber-pink">
              <FaShieldAlt className="animate-pulse" />
              <span>Red Teaming</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6">
            <Link 
              href="/machines" 
              className="border-2 border-cyber-green text-cyber-green px-8 py-4 rounded-lg font-bold hover:bg-cyber-green hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/50 transform hover:scale-105"
            >
              View HTB Labs
            </Link>
            <Link 
              href="/about" 
              className="border border-cyber-green text-cyber-green px-8 py-4 rounded-lg font-bold hover:bg-cyber-green hover:text-black transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      

      {/* Stats Dashboard */}
      <section className="py-16">
        {adminMode && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-cyber-green/10 border border-cyber-green/30 px-4 py-2 rounded-lg">
              <FaCog className="text-cyber-green animate-spin" />
              <span className="text-cyber-green text-sm font-bold">Admin Mode Active - Hover over stats to edit</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg hover:border-cyber-green transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <FaTerminal className="text-2xl text-cyber-green group-hover:animate-pulse" />
              {renderEditableField('machinesPwned', htbStats.machinesPwned, htbStats.machinesPwned.toString())}
            </div>
            <h3 className="text-lg font-semibold mb-2">Machines Pwned</h3>
            <p className="text-sm text-gray-400">HTB boxes rooted</p>
          </div>
          
          <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg hover:border-cyber-green transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <FaCode className="text-2xl text-cyber-purple group-hover:animate-pulse" />
              {renderEditableField('globalRanking', htbStats.globalRanking, `#${htbStats.globalRanking.toLocaleString()}`)}
            </div>
            <h3 className="text-lg font-semibold mb-2">Global HTB Ranking</h3>
            <p className="text-sm text-gray-400">Worldwide position</p>
          </div>
          
          <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg hover:border-cyber-green transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <FaBug className="text-2xl text-cyber-pink group-hover:animate-pulse" />
              {renderEditableField('finalScore', htbStats.finalScore, htbStats.finalScore.toString())}
            </div>
            <h3 className="text-lg font-semibold mb-2">Final Score</h3>
            <p className="text-sm text-gray-400">HTB points accumulated</p>
          </div>
          
          <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg hover:border-cyber-green transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <FaShieldAlt className="text-2xl text-cyber-blue group-hover:animate-pulse" />
              {renderEditableField('htbRank', htbStats.htbRank, htbStats.htbRank)}
            </div>
            <h3 className="text-lg font-semibold mb-2">HTB Rank</h3>
            <p className="text-sm text-gray-400">Current tier level</p>
            {saveMessage && <div className="text-sm mt-2 text-green-400">{saveMessage}</div>}
          </div>
          
        </div>
      </section>
      
      {/* Recent Activity */}
      <section className="py-16">
        <h2 className="text-3xl font-cyber font-bold mb-8 text-center">
          <span className="glitch" data-text="Recent Activity">
            Recent Activity
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Latest Writeups */}
          <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-cyber-green">Latest Writeups</h3>
            <div className="space-y-4">
              {latestMachines.length > 0 ? (
                latestMachines.map(machine => (
                  <div 
                    key={machine.id} 
                    className={`border-l-4 ${getDifficultyColor(machine.difficulty)} pl-4 transition-all duration-300 hover:bg-cyber-green/10 py-2`}
                  >
                    <Link href={`/machines#${machine.id}`}>
                      <h4 className="font-semibold hover:text-cyber-blue cursor-pointer">{machine.name} - {machine.tags[0]}</h4>
                    </Link>
                    <p className="text-sm text-gray-400">
                      {machine.os} | {machine.difficulty} | {machine.dateCompleted ? getTimeAgo(machine.dateCompleted) : 'N/A'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No completed machines yet. Go pwn some boxes!</p>
              )}
            </div>
          </div>
          
{/* Tools & Exploits */}
          <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-cyber-green">Latest Tools</h3>
            <div className="space-y-4">
              {tools.length > 0 ? (
                tools.map((tool: Tool) => (
                  <div key={tool.id} className="border-l-4 border-cyber-green pl-4">
                    <h4 className="font-semibold">{tool.name}</h4>
                    <p className="text-sm text-gray-400">{tool.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Loading tools...</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
