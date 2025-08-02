'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({
  title,
  description,
  keywords = [],
  image,
  article = false,
  publishedTime,
  modifiedTime,
  author = "0xJerry",
  section,
  tags = []
}: SEOProps) {
  const pathname = usePathname();
  
  // Automatically detect the site URL
  const getSiteUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    // Fallback for server-side rendering
    return process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://localhost:3000';
  };
  
  const siteUrl = getSiteUrl();
  const currentUrl = `${siteUrl}${pathname}`;
  
  const defaultTitle = "0xJerry's Lab - Cybersecurity Research & HTB Writeups";
  const defaultDescription = "Expert cybersecurity research, penetration testing tutorials, and detailed Hack The Box writeups. Learn offensive security techniques, exploit development, and ethical hacking.";
  const defaultImage = "https://securehive.securenotepad.tech/Gemini_Generated_Image_d1jhvwd1jhvwd1jh.png";
  
  const seoTitle = title ? `${title} | 0xJerry's Lab` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoKeywords = [...new Set([...keywords, "cybersecurity", "ethical hacking", "HTB", "penetration testing"])];

  // Generate structured data
  const generateStructuredData = () => {
    const baseStructuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          "url": siteUrl,
          "name": "0xJerry's Lab",
          "description": defaultDescription,
          "publisher": {
            "@id": `${siteUrl}/#person`
          },
          "inLanguage": "en-US",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${siteUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "Person",
          "@id": `${siteUrl}/#person`,
          "name": "0xJerry",
          "description": "Cybersecurity researcher and penetration tester specializing in ethical hacking, vulnerability research, and HTB challenges.",
          "url": siteUrl,
          "sameAs": [
            "https://twitter.com/0xJerry",
            "https://github.com/jery0843",
            "https://linkedin.com/in/jeromeandrewk"
          ],
          "jobTitle": "Cybersecurity Researcher",
          "worksFor": {
            "@type": "Organization",
            "name": "0xJerry's Lab"
          },
          "knowsAbout": [
            "Cybersecurity",
            "Penetration Testing",
            "Ethical Hacking",
            "Vulnerability Research",
            "Exploit Development",
            "Red Team Operations"
          ]
        },
        {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          "name": "0xJerry's Lab",
          "url": siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": seoImage,
            "width": 1200,
            "height": 630
          },
          "description": defaultDescription,
          "founder": {
            "@id": `${siteUrl}/#person`
          },
          "sameAs": [
            "https://twitter.com/0xJerry",
            "https://github.com/jery0843"
          ]
        }
      ]
    };

    // Add article structured data if it's an article
    if (article && publishedTime) {
      const articleData: any = {
        "@type": "Article",
        "@id": `${currentUrl}/#article`,
        "headline": title || defaultTitle,
        "description": seoDescription,
        "image": {
          "@type": "ImageObject",
          "url": seoImage,
          "width": 1200,
          "height": 630
        },
        "author": {
          "@id": `${siteUrl}/#person`
        },
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": currentUrl,
        "articleSection": section || "Cybersecurity",
        "keywords": seoKeywords.join(", "),
        "inLanguage": "en-US"
      };
      baseStructuredData["@graph"].push(articleData);
    }

    // Add breadcrumb structured data
    const pathSegments = pathname.split('/').filter(segment => segment);
    if (pathSegments.length > 0) {
      const breadcrumbList: any = {
        "@type": "BreadcrumbList",
        "@id": `${currentUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
          }
        ]
      };

      pathSegments.forEach((segment, index) => {
        const segmentUrl = `${siteUrl}/${pathSegments.slice(0, index + 1).join('/')}`;
        const segmentName = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        
        breadcrumbList.itemListElement.push({
          "@type": "ListItem",
          "position": index + 2,
          "name": segmentName,
          "item": segmentUrl
        });
      });

      baseStructuredData["@graph"].push(breadcrumbList);
    }

    return JSON.stringify(baseStructuredData);
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords.join(", ")} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="0xJerry's Lab" />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content="0xJerry's Lab - Cybersecurity Research Portal" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph tags */}
      {article && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime || publishedTime} />
          <meta property="article:author" content={author} />
          <meta property="article:section" content={section || "Cybersecurity"} />
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@0xJerry" />
      <meta name="twitter:creator" content="@0xJerry" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:image:alt" content="0xJerry's Lab - Cybersecurity Research Portal" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#00ff88" />
      <meta name="msapplication-TileColor" content="#00ff88" />
      <meta name="application-name" content="0xJerry's Lab" />
      <meta name="apple-mobile-web-app-title" content="0xJerry's Lab" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateStructuredData() }}
      />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://securehive.securenotepad.tech" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//securehive.securenotepad.tech" />
    </Head>
  );
}
