import { NextResponse } from 'next/server';

interface LatestTool {
  id: string;
  name: string;
  description: string;
  link: string;
  tags: string[];
  source: string;
  publishedAt: string;
  stars?: number;
  language?: string;
}

// Fetch latest tools from GitHub trending
async function fetchTrendingGitHubTools(): Promise<LatestTool[]> {
  const tools: LatestTool[] = [];
  
  try {
    // Search for security-related repositories created in the last 30 days
    const queries = [
      'security created:>2024-01-01 stars:>10',
      'pentesting created:>2024-01-01 stars:>5',
      'cybersecurity created:>2024-01-01 stars:>5',
      'hacking created:>2024-01-01 stars:>10'
    ];
    
    for (const query of queries) {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=5`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': '0xjerrys-lab'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          data.items?.forEach((repo: any) => {
            tools.push({
              id: `trending-${repo.id}`,
              name: repo.name,
              description: repo.description || 'Trending security tool',
              link: repo.html_url,
              tags: extractTagsFromRepo(repo),
              source: 'GitHub Trending',
              publishedAt: repo.created_at,
              stars: repo.stargazers_count,
              language: repo.language
            });
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch trending tools for query: ${query}`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching trending GitHub tools:', error);
  }
  
  return tools;
}

// Fetch latest tools from awesome lists
async function fetchAwesomeListTools(): Promise<LatestTool[]> {
  const tools: LatestTool[] = [];
  
  try {
    // Fetch from awesome-security repository
    const response = await fetch(
      'https://api.github.com/repos/sbilly/awesome-security/contents/README.md',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': '0xjerrys-lab'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      // Extract GitHub links from the markdown content
      const githubLinks = content.match(/https:\/\/github\.com\/[^\s\)\]]+/g) || [];
      
      // Take first 10 unique links
      const uniqueLinks = [...new Set(githubLinks)].slice(0, 10);
      
      for (const link of uniqueLinks) {
        const match = link.match(/github\.com\/([^\/]+\/[^\/]+)/);
        if (match) {
          const repoPath = match[1];
          
          try {
            const repoResponse = await fetch(`https://api.github.com/repos/${repoPath}`, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': '0xjerrys-lab'
              }
            });
            
            if (repoResponse.ok) {
              const repo = await repoResponse.json();
              tools.push({
                id: `awesome-${repo.id}`,
                name: repo.name,
                description: repo.description || 'Tool from awesome-security list',
                link: repo.html_url,
                tags: extractTagsFromRepo(repo),
                source: 'Awesome Security',
                publishedAt: repo.created_at,
                stars: repo.stargazers_count,
                language: repo.language
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch repo details for ${repoPath}`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching awesome list tools:', error);
  }
  
  return tools;
}

// Extract tags from repository data
function extractTagsFromRepo(repo: any): string[] {
  const tags: string[] = [];
  const name = repo.name.toLowerCase();
  const description = (repo.description || '').toLowerCase();
  const topics = repo.topics || [];
  
  // Add language tag
  if (repo.language) {
    tags.push(repo.language);
  }
  
  // Add category tags based on keywords
  if (name.includes('web') || description.includes('web')) tags.push('Web');
  if (name.includes('network') || description.includes('network')) tags.push('Network');
  if (name.includes('mobile') || description.includes('mobile')) tags.push('Mobile');
  if (name.includes('forensic') || description.includes('forensic')) tags.push('Forensics');
  if (name.includes('malware') || description.includes('malware')) tags.push('Malware');
  if (name.includes('reverse') || description.includes('reverse')) tags.push('Reverse Engineering');
  if (name.includes('crypto') || description.includes('crypto')) tags.push('Cryptography');
  
  // Add topic tags
  topics.forEach((topic: string) => {
    tags.push(topic.charAt(0).toUpperCase() + topic.slice(1));
  });
  
  return tags.length > 0 ? [...new Set(tags)] : ['Security'];
}

// Fetch latest CVE-related tools
async function fetchCVETools(): Promise<LatestTool[]> {
  const tools: LatestTool[] = [];
  
  try {
    // Search for recent CVE proof-of-concept repositories
    const response = await fetch(
      'https://api.github.com/search/repositories?q=CVE-2024 in:name created:>2024-01-01&sort=updated&order=desc&per_page=10',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': '0xjerrys-lab'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      data.items?.forEach((repo: any) => {
        tools.push({
          id: `cve-${repo.id}`,
          name: repo.name,
          description: repo.description || 'CVE proof-of-concept',
          link: repo.html_url,
          tags: ['CVE', 'Exploit', ...(repo.topics || [])],
          source: 'CVE PoC',
          publishedAt: repo.created_at,
          stars: repo.stargazers_count,
          language: repo.language
        });
      });
    }
  } catch (error) {
    console.error('Error fetching CVE tools:', error);
  }
  
  return tools;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const limit = parseInt(searchParams.get('limit') || '20');
  
  try {
    let allTools: LatestTool[] = [];
    
    if (category === 'trending' || category === 'all') {
      const trending = await fetchTrendingGitHubTools();
      allTools.push(...trending);
    }
    
    if (category === 'awesome' || category === 'all') {
      const awesome = await fetchAwesomeListTools();
      allTools.push(...awesome);
    }
    
    if (category === 'cve' || category === 'all') {
      const cve = await fetchCVETools();
      allTools.push(...cve);
    }
    
    // Remove duplicates and sort by stars/date
    const uniqueTools = allTools
      .filter((tool, index, self) => 
        index === self.findIndex(t => t.name === tool.name)
      )
      .sort((a, b) => {
        // Sort by stars first, then by publish date
        if (a.stars && b.stars && a.stars !== b.stars) {
          return b.stars - a.stars;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, limit);
    
    return NextResponse.json({
      tools: uniqueTools,
      meta: {
        total: uniqueTools.length,
        category,
        lastUpdated: new Date().toISOString(),
        sources: ['GitHub Trending', 'Awesome Security', 'CVE PoC']
      }
    });
    
  } catch (error) {
    console.error('Error fetching latest tools:', error);
    return NextResponse.json(
      { 
        error: 'Unable to fetch latest tools data.',
        meta: {
          category,
          lastUpdated: new Date().toISOString(),
          sources: []
        }
      }, 
      { status: 500 }
    );
  }
}
