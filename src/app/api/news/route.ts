import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

interface NewsItem {
  title: string;
  link: string;
  summary: string;
  timestamp: string;
  source: string;
  tags: string[];
}

// Mock data for demonstration - replace with actual RSS parsing
const mockNews: NewsItem[] = [
  {
    title: "New Windows Zero-Day Exploits Found in the Wild",
    link: "https://example.com/news1",
    summary: "Security researchers have discovered active exploitation of a previously unknown Windows vulnerability affecting privilege escalation...",
    timestamp: "2 hours ago",
    source: "The Hacker News",
    tags: ["Windows", "Zero-Day", "Privilege Escalation"]
  },
  {
    title: "Critical Apache Struts Vulnerability CVE-2024-1337",
    link: "https://example.com/news2", 
    summary: "Apache has released patches for a critical remote code execution vulnerability in Struts framework versions 2.5.0 to 2.5.32...",
    timestamp: "4 hours ago",
    source: "Krebs on Security",
    tags: ["Apache", "RCE", "CVE"]
  },
  {
    title: "Russian Hackers Target European Energy Infrastructure",
    link: "https://example.com/news3",
    summary: "Intelligence agencies report coordinated attacks on power grid systems across multiple European nations...",
    timestamp: "6 hours ago", 
    source: "The Hacker News",
    tags: ["APT", "Infrastructure", "Europe"]
  },
  {
    title: "Docker Container Escape Techniques in Production",
    link: "https://example.com/news4",
    summary: "New research demonstrates multiple container breakout methods affecting default Docker configurations...",
    timestamp: "8 hours ago",
    source: "Security Research",
    tags: ["Docker", "Container", "Escape"]
  },
  {
    title: "AI-Powered Phishing Attacks Bypass Traditional Detection",
    link: "https://example.com/news5",
    summary: "Machine learning models are being weaponized to create highly convincing phishing campaigns that evade security filters...",
    timestamp: "12 hours ago",
    source: "Krebs on Security", 
    tags: ["AI", "Phishing", "Social Engineering"]
  }
];

async function fetchRSSFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, 5).map(item => ({
      title: item.title || 'No title',
      link: item.link || '#',
      summary: (item.contentSnippet || item.summary || 'No summary available').substring(0, 200) + '...',
      timestamp: getTimeAgo(item.pubDate ? new Date(item.pubDate) : new Date()),
      source: sourceName,
      tags: extractTags(item.title || '', item.contentSnippet || '')
    }));
  } catch (error) {
    console.error(`Error fetching RSS from ${sourceName}:`, error);
    return [];
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
}

function extractTags(title: string, content: string): string[] {
  const text = (title + ' ' + content).toLowerCase();
  const tagMap: { [key: string]: string } = {
    'zero.day|0.day': 'Zero-Day',
    'vulnerability|vuln|cve': 'Vulnerability',
    'malware|trojan|ransomware': 'Malware',
    'phishing|social.engineering': 'Phishing',
    'apt|advanced.persistent': 'APT',
    'windows|microsoft': 'Windows',
    'linux|unix': 'Linux',
    'android|mobile': 'Mobile',
    'ios|iphone|apple': 'iOS',
    'docker|container': 'Container',
    'kubernetes|k8s': 'Kubernetes',
    'cloud|aws|azure|gcp': 'Cloud',
    'ai|artificial.intelligence|machine.learning': 'AI',
    'blockchain|crypto|bitcoin': 'Crypto',
    'ddos|denial.of.service': 'DDoS',
    'sql.injection|sqli': 'SQLi',
    'xss|cross.site': 'XSS',
    'rce|remote.code.execution': 'RCE'
  };
  
  const tags: string[] = [];
  for (const [pattern, tag] of Object.entries(tagMap)) {
    const regex = new RegExp(pattern.replace(/\./g, '\\s*'), 'i');
    if (regex.test(text) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags.length > 0 ? tags.slice(0, 3) : ['Security'];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);  
  const fresh = searchParams.get('fresh') === 'true';
  
  try {
    const feeds = [
      { url: 'https://feeds.feedburner.com/TheHackersNews', name: 'The Hacker News' },
      { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security' },
      { url: 'https://www.darkreading.com/rss.xml', name: 'Dark Reading' },
      { url: 'https://threatpost.com/feed/', name: 'Threatpost' }
    ];
    
    const allNews: NewsItem[] = [];
    
    // Fetch from all RSS feeds
    for (const feed of feeds) {
      try {
        const feedNews = await fetchRSSFeed(feed.url, feed.name);
        allNews.push(...feedNews);
      } catch (error) {
        console.error(`Failed to fetch from ${feed.name}:`, error);
      }
    }
    
    // Sort by publication date (newest first) and limit to 15 items
    const sortedNews = allNews
      .sort((a, b) => {
        // Simple sorting by timestamp string for now
        return a.timestamp.localeCompare(b.timestamp);
      })
      .slice(0, 15);
    
    // If no news was fetched, fall back to mock data
    if (sortedNews.length === 0) {
      console.log('No RSS feeds available, using mock data');
      return NextResponse.json(mockNews);
    }
    
    return NextResponse.json(sortedNews);
  } catch (error) {
    console.error('Error in news API:', error);
    // Fallback to mock data on error
    return NextResponse.json(mockNews);
  }
}
