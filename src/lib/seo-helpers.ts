// SEO Helper functions for better search engine indexing

export async function notifySearchEngines(siteUrl?: string) {
  // Auto-detect site URL if not provided
  const finalSiteUrl = siteUrl || 
    (typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://localhost:3000'
    );
  
  const sitemapUrl = `${finalSiteUrl}/sitemap.xml`;
  const machinesSitemapUrl = `${finalSiteUrl}/sitemap-machines.xml`;
  
  const notifications = [
    // Google
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.google.com/ping?sitemap=${encodeURIComponent(machinesSitemapUrl)}`,
    
    // Bing
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(machinesSitemapUrl)}`,
  ];

  const results = await Promise.allSettled(
    notifications.map(url => 
      fetch(url, { method: 'GET' }).catch(e => console.warn('Sitemap ping failed:', e))
    )
  );

  console.log('🔍 Notified search engines about sitemap updates');
  return results;
}

export function generateMachineKeywords(machineName: string, os: string, difficulty: string, tags: string[]) {
  const baseKeywords = [
    'hackthebox',
    'hack the box',
    'HTB',
    'cybersecurity',
    'penetration testing',
    'ethical hacking',
    'writeup',
    'walkthrough',
    'exploit',
    'vulnerability'
  ];

  const machineSpecific = [
    `${machineName.toLowerCase()} hackthebox`,
    `${machineName.toLowerCase()} htb`,
    `${machineName.toLowerCase()} writeup`,
    `${machineName.toLowerCase()} walkthrough`,
    `${machineName.toLowerCase()} ${os.toLowerCase()}`,
    `${machineName.toLowerCase()} ${difficulty.toLowerCase()}`,
    `htb ${machineName.toLowerCase()}`,
    `hackthebox ${machineName.toLowerCase()}`
  ];

  const tagKeywords = tags.map(tag => [
    `${tag.toLowerCase()} hackthebox`,
    `${tag.toLowerCase()} htb`,
    `${machineName.toLowerCase()} ${tag.toLowerCase()}`
  ]).flat();

  return [...new Set([...baseKeywords, ...machineSpecific, ...tagKeywords])];
}

export function generateMachineDescription(machineName: string, os: string, difficulty: string, tags: string[]) {
  const primaryTag = tags[0] || 'exploitation';
  
  return `Complete ${machineName} Hack The Box writeup and walkthrough. Learn ${primaryTag.toLowerCase()} techniques on ${os} with this ${difficulty.toLowerCase()} HTB machine. Step-by-step penetration testing guide by 0xJerry.`;
}

export function generateMachineTitle(machineName: string, os: string, difficulty: string) {
  return `${machineName} HTB Writeup - ${os} ${difficulty} | 0xJerry's Lab`;
}

// Social media optimization
export function generateSocialDescription(machineName: string, difficulty: string, tags: string[]) {
  const emoji = difficulty === 'Easy' ? '🟢' : difficulty === 'Medium' ? '🟡' : '🔴';
  const primaryTag = tags[0] || 'exploitation';
  
  return `${emoji} Just pwned ${machineName} on @hackthebox! ${difficulty} ${primaryTag} machine. Full writeup with step-by-step exploitation techniques. #HTB #CyberSecurity #EthicalHacking`;
}
