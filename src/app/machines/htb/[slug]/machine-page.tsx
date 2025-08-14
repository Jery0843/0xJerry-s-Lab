'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { FaArrowLeft, FaCalendarAlt, FaTag, FaTrophy, FaExclamationCircle, FaDesktop, FaWindows, FaLinux, FaClock } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

interface Machine {
  id: string;
  name: string;
  os: string;
  difficulty: string;
  status: string;
  dateCompleted: string | null;
  tags: string[] | string;
  writeup: string | null;
}

interface MachinePageProps {
  machine: Machine;
}

export default function MachinePage({ machine }: MachinePageProps) {
  const [relatedMachines, setRelatedMachines] = useState<Machine[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  
  // Handle tags - ensure it's an array
  const tagsArray = useMemo((): string[] => {
    if (Array.isArray(machine.tags)) {
      return machine.tags;
    } else if (typeof machine.tags === 'string') {
      try {
        // Try to parse as JSON array first
        return JSON.parse(machine.tags);
      } catch {
        // If parsing fails, split by comma or treat as single tag
        return machine.tags.includes(',') ? machine.tags.split(',').map(t => t.trim()) : [machine.tags];
      }
    }
    return [];
  }, [machine.tags]);
  
  // Fetch related machines from database
  useEffect(() => {
    const fetchRelatedMachines = async () => {
      try {
        setLoadingRelated(true);
        
        // Try to fetch from database first
        const response = await fetch('/api/admin/htb-machines-d1');
        let allMachines: Machine[] = [];
        
        if (response.ok) {
          allMachines = await response.json();
        }
        
        // If no data from database, fallback to checking localStorage
        if (allMachines.length === 0) {
          const savedMachines = localStorage.getItem('htb-machines');
          if (savedMachines) {
            try {
              allMachines = JSON.parse(savedMachines);
            } catch (error) {
              console.error('Error parsing saved machines:', error);
            }
          }
        }
        
        // Filter and sort related machines
        const related = allMachines
          .filter(m => {
            if (m.id === machine.id) return false;
            
            // Check if machine has matching tags, OS, or difficulty
            let relatedMachineTags: string[] = [];
            if (Array.isArray(m.tags)) {
              relatedMachineTags = m.tags;
            } else if (typeof m.tags === 'string') {
              try {
                relatedMachineTags = JSON.parse(m.tags);
              } catch {
                relatedMachineTags = m.tags.includes(',') ? m.tags.split(',').map(t => t.trim()) : [m.tags];
              }
            }
            
            const hasMatchingTags = tagsArray.some(tag => 
              relatedMachineTags.some(relatedTag => 
                relatedTag.toLowerCase().includes(tag.toLowerCase()) || 
                tag.toLowerCase().includes(relatedTag.toLowerCase())
              )
            );
            
            return hasMatchingTags || m.os === machine.os || m.difficulty === machine.difficulty;
          })
          .sort((a, b) => {
            // Calculate relevance scores
            let aScore = 0;
            let bScore = 0;
            
            // Process tags for machine a
            let aTagsArray: string[] = [];
            if (Array.isArray(a.tags)) {
              aTagsArray = a.tags;
            } else if (typeof a.tags === 'string') {
              try {
                aTagsArray = JSON.parse(a.tags);
              } catch {
                aTagsArray = a.tags.includes(',') ? a.tags.split(',').map(t => t.trim()) : [a.tags];
              }
            }
            
            // Process tags for machine b
            let bTagsArray: string[] = [];
            if (Array.isArray(b.tags)) {
              bTagsArray = b.tags;
            } else if (typeof b.tags === 'string') {
              try {
                bTagsArray = JSON.parse(b.tags);
              } catch {
                bTagsArray = b.tags.includes(',') ? b.tags.split(',').map(t => t.trim()) : [b.tags];
              }
            }
            
            // Score for matching tags (highest priority - 3 points per match)
            const aTagMatches = tagsArray.filter(tag => 
              aTagsArray.some(aTag => 
                aTag.toLowerCase().includes(tag.toLowerCase()) || 
                tag.toLowerCase().includes(aTag.toLowerCase())
              )
            ).length;
            
            const bTagMatches = tagsArray.filter(tag => 
              bTagsArray.some(bTag => 
                bTag.toLowerCase().includes(tag.toLowerCase()) || 
                tag.toLowerCase().includes(bTag.toLowerCase())
              )
            ).length;
            
            aScore += aTagMatches * 3;
            bScore += bTagMatches * 3;
            
            // Score for same OS (medium priority - 2 points)
            if (a.os === machine.os) aScore += 2;
            if (b.os === machine.os) bScore += 2;
            
            // Score for same difficulty (lower priority - 1 point)
            if (a.difficulty === machine.difficulty) aScore += 1;
            if (b.difficulty === machine.difficulty) bScore += 1;
            
            return bScore - aScore;
          })
          .slice(0, 3);
        
        setRelatedMachines(related);
      } catch (error) {
        console.error('Error fetching related machines:', error);
        setRelatedMachines([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedMachines();
  }, [machine.id, machine.os, machine.difficulty, tagsArray]);

  const getOSIcon = () => {
    switch (machine.os.toLowerCase()) {
      case 'windows':
        return <FaWindows className="text-cyber-blue" />;
      case 'linux':
        return <FaLinux className="text-cyber-green" />;
      default:
        return <FaDesktop className="text-cyber-purple" />;
    }
  };

  const getDifficultyColor = () => {
    switch (machine.difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400 border-green-400';
      case 'medium':
        return 'text-yellow-400 border-yellow-400';
      case 'hard':
        return 'text-red-400 border-red-400';
      case 'insane':
        return 'text-purple-400 border-purple-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusColor = () => {
    switch (machine.status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-400';
      case 'in progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400';
    }
  };

  return (
    <Layout>
      <div className="py-4 md:py-8 px-4 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6 md:mb-8 overflow-x-auto">
          <Link href="/" className="text-cyber-blue hover:text-cyber-green transition-colors whitespace-nowrap">Home</Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <Link href="/machines" className="text-cyber-blue hover:text-cyber-green transition-colors whitespace-nowrap">Machines</Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <Link href="/machines/htb" className="text-cyber-blue hover:text-cyber-green transition-colors whitespace-nowrap">HTB</Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400 truncate">{machine.name}</span>
        </nav>

        {/* Back Button */}
        <Link
          href="/machines/htb"
          className="inline-flex items-center text-cyber-blue hover:text-cyber-green mb-4 md:mb-6 transition-colors text-sm md:text-base"
        >
          <FaArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          Back to HTB Machines
        </Link>

        {/* Machine Header */}
        <div className="bg-card-bg border border-cyber-green/30 rounded-lg p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 md:gap-6">
            {/* Machine Image */}
            <div className="flex-shrink-0 self-center lg:self-start">
              <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-lg shadow-md flex items-center justify-center text-white text-2xl md:text-3xl lg:text-4xl font-bold border border-cyber-green/30">
                {machine.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Machine Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-cyber font-bold text-cyber-green mb-2 break-words" data-text={machine.name}>
                {machine.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-4 md:mb-6">Hack The Box Machine Writeup</p>
              
              {/* Machine Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  {getOSIcon()}
                  <div className="text-left">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Operating System</div>
                    <div className="text-gray-900 dark:text-white font-semibold text-sm md:text-base">{machine.os}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <FaExclamationCircle className={getDifficultyColor().split(' ')[0]} />
                  <div className="text-left">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
                    <div className={`font-semibold text-sm md:text-base ${getDifficultyColor().split(' ')[0]}`}>
                      {machine.difficulty}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <FaTrophy className="text-cyber-green" />
                  <div className="text-left">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Status</div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor()}`}>
                      {machine.status === 'In Progress' && <FaClock className="w-3 h-3 inline mr-1" />}
                      {machine.status}
                    </div>
                  </div>
                </div>

                {machine.dateCompleted && (
                  <div className="flex items-center space-x-3 justify-center lg:justify-start">
                    <FaCalendarAlt className="text-cyber-green" />
                    <div className="text-left">
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Completed</div>
                      <div className="text-gray-900 dark:text-white font-semibold text-sm md:text-base">
                        {new Date(machine.dateCompleted).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4 md:mb-6">
                <FaTag className="text-cyber-green flex-shrink-0" />
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {tagsArray.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 md:px-3 py-1 bg-cyber-green/20 text-cyber-green text-xs md:text-sm rounded-full border border-cyber-green/30 whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Writeup Section */}
        <div className="bg-card-bg border border-cyber-green/30 rounded-lg p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-cyber-green mb-4 md:mb-6">Machine Writeup</h2>
          
          {machine.writeup ? (
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-sm md:text-base">
              <ReactMarkdown 
                components={{
                  code: ({ children, className }) => (
                    <code className={`bg-terminal-bg p-1 rounded text-cyber-green border border-cyber-green/30 text-xs md:text-sm ${className || ''}`}>
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-terminal-bg p-3 md:p-4 rounded border border-cyber-green/30 my-4 overflow-x-auto text-xs md:text-sm">
                      {children}
                    </pre>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl md:text-2xl font-bold text-cyber-green mb-3 md:mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg md:text-xl font-bold text-cyber-blue mb-2 md:mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base md:text-lg font-bold text-cyber-purple mb-2">{children}</h3>
                  ),
                }}
              >
                {machine.writeup}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <FaExclamationCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-400 mb-2">
                Writeup Coming Soon
              </h3>
              {machine.status === 'In Progress' ? (
                <p className="text-yellow-400 text-sm md:text-base">This machine is currently being worked on. Check back soon!</p>
              ) : (
                <p className="text-gray-500 text-sm md:text-base">Writeup will be published once completed.</p>
              )}
            </div>
          )}
        </div>

        {/* Similar Machines */}
        <div className="bg-card-bg border border-cyber-green/30 rounded-lg p-4 md:p-6 lg:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-cyber-green mb-4 md:mb-6">Similar Machines</h2>
          
          {loadingRelated ? (
            <div className="text-center py-6 md:py-8">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-terminal-bg border border-cyber-green/30 rounded-lg p-3 md:p-4">
                      <div className="h-5 md:h-6 bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 md:h-4 bg-gray-700 rounded mb-1"></div>
                      <div className="h-2 md:h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : relatedMachines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {relatedMachines.map((relatedMachine) => (
                <Link
                  key={relatedMachine.id}
                  href={`/machines/${relatedMachine.id}`}
                  className="block bg-terminal-bg border border-cyber-green/30 rounded-lg p-3 md:p-4 hover:border-cyber-green transition-colors group"
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-cyber-green transition-colors break-words">
                    {relatedMachine.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs md:text-sm mb-2 gap-2">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="text-gray-600 dark:text-gray-400 truncate">{relatedMachine.os}</span>
                      {(() => {
                        // Check for tag matches
                        let relatedMachineTags: string[] = [];
                        if (Array.isArray(relatedMachine.tags)) {
                          relatedMachineTags = relatedMachine.tags;
                        } else if (typeof relatedMachine.tags === 'string') {
                          try {
                            relatedMachineTags = JSON.parse(relatedMachine.tags);
                          } catch {
                            relatedMachineTags = relatedMachine.tags.includes(',') ? relatedMachine.tags.split(',').map(t => t.trim()) : [relatedMachine.tags];
                          }
                        }
                        
                        const hasMatchingTags = tagsArray.some(tag => 
                          relatedMachineTags.some(relatedTag => 
                            relatedTag.toLowerCase().includes(tag.toLowerCase()) || 
                            tag.toLowerCase().includes(relatedTag.toLowerCase())
                          )
                        );
                        
                        if (hasMatchingTags) {
                          return <span className="text-xs bg-cyber-green/20 text-cyber-green px-1 md:px-2 py-1 rounded whitespace-nowrap">Similar Tags</span>;
                        } else if (relatedMachine.os === machine.os) {
                          return <span className="text-xs bg-cyber-blue/20 text-cyber-blue px-1 md:px-2 py-1 rounded whitespace-nowrap">Same OS</span>;
                        }
                        return null;
                      })()}
                    </div>
                    <span className={`whitespace-nowrap ${
                      relatedMachine.difficulty === 'Easy' ? 'text-green-400' :
                      relatedMachine.difficulty === 'Medium' ? 'text-yellow-400' :
                      relatedMachine.difficulty === 'Hard' ? 'text-red-400' :
                      'text-purple-400'
                    }`}>
                      {relatedMachine.difficulty}
                      {relatedMachine.difficulty === machine.difficulty && (
                        <span className="ml-1 text-xs">⭐</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-500 break-words">
                    Status: {relatedMachine.status}
                    {relatedMachine.dateCompleted && (
                      <span className="block sm:inline sm:ml-2">
                        <span className="sm:hidden">• </span><span className="hidden sm:inline">• </span>Completed {new Date(relatedMachine.dateCompleted).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8">
              <FaExclamationCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-500 dark:text-gray-400 mx-auto mb-3 md:mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm md:text-base">No similar machines found</p>
              <Link href="/machines" className="text-cyber-blue hover:text-cyber-green transition-colors text-sm md:text-base">
                Browse all machines →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
