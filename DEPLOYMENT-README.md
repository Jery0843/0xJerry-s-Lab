# 🚀 CyberLab Hosting Deployment Guide

This folder contains only the essential files needed for hosting your CyberLab application.

## 📁 Folder Contents

- **`.next/`** - Pre-built Next.js application (ready for hosting)
- **`src/`** - Source code (all fixed and optimized)
- **`public/`** - Static assets
- **`database/`** - Database schema files
- **Configuration files** - All necessary config files for deployment

## 🌐 Quick Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from this folder
cd Lab-hosting-new
vercel

# Set environment variables in Vercel dashboard
```

### Option 2: Cloudflare Pages
```bash
# Upload this folder to Cloudflare Pages
# Configure build settings:
# - Build command: npm run build
# - Output directory: .next
```

### Option 3: Netlify
```bash
# Deploy via Netlify CLI or web interface
# Build settings:
# - Build command: npm run build
# - Publish directory: .next
```

## ⚙️ Environment Variables Setup

**IMPORTANT**: Copy all variables from `.env.example` to your hosting platform's environment variables section.

### Required Variables:
- `ENABLE_REDDIT_API=true` (to enable Reddit memes)
- `REDDIT_CLIENT_ID` (get from https://www.reddit.com/prefs/apps)
- `REDDIT_CLIENT_SECRET` (get from https://www.reddit.com/prefs/apps)
- All other variables from `.env.example`

### For Reddit API:
1. Go to https://www.reddit.com/prefs/apps
2. Create new app (type: script)
3. Copy Client ID and Secret to your hosting environment variables

## 🔧 Fixed Issues in This Version

✅ **Reddit API Integration**: Now works in hosting environments when `ENABLE_REDDIT_API=true`
✅ **THM Rooms Error**: Fixed `room.tags.some is not a function` error
✅ **Environment Detection**: Smart detection between development and production
✅ **Hosting Compatibility**: Optimized for Vercel, Cloudflare, and other platforms

## 📊 File Size (Optimized)
- Total size: ~50MB (vs ~800MB+ in development)
- Only production-ready files included
- No development dependencies

## 🚀 Deployment Steps

1. **Upload this folder** to your hosting platform
2. **Set environment variables** from `.env.example`
3. **Get Reddit API credentials** (optional but recommended)
4. **Deploy** and enjoy your CyberLab!

## 🔍 Testing

After deployment, test these endpoints:
- `/` - Homepage
- `/api/cybersecurity-meme` - Meme API (should show Reddit or curated memes)
- `/machines/htb` - HTB machines page
- `/machines/thm` - THM rooms page (no more errors!)

## 🆘 Troubleshooting

**Memes not from Reddit?**
- Check `ENABLE_REDDIT_API=true` in environment variables
- Verify Reddit API credentials are set
- Check hosting platform logs

**THM rooms error?**
- This has been fixed in this deployment package
- Ensure you're using this updated version

**Build fails?**
- Make sure all environment variables are set
- Check Node.js version (18+ recommended)

## 📞 Support

If you encounter issues, check the logs in your hosting platform or review the environment variables setup.

Happy hosting! 🎉
