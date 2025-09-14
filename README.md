# 0xJerry's Lab - Cybersecurity Learning Platform

A modern cybersecurity learning platform built with Next.js, featuring machine writeups from Hack The Box and TryHackMe, vulnerability research, and penetration testing tools.

## 🚀 Features

### Machine Labs
- **Hack The Box Integration**: Track and manage HTB machine progress with detailed writeups
- **TryHackMe Support**: Complete room tracking with guided learning paths
- **Unified Interface**: Seamless experience across both platforms
- **Progress Tracking**: Visual dashboards for completion stats and rankings
- **Advanced Filtering**: Search by difficulty, status, OS, and tags

### Content Management
- **Dynamic Content**: Real-time vulnerability feeds and security news
- **Admin Dashboard**: Content management with authentication
- **Writeup System**: Markdown-based writeups with syntax highlighting
- **SEO Optimized**: Dynamic metadata generation for better search visibility

### Technical Stack
- **Frontend**: Next.js 15 with TypeScript and TailwindCSS
- **Database**: Cloudflare D1 for serverless data storage
- **Deployment**: Vercel with Cloudflare Workers integration
- **Styling**: Custom cyberpunk theme with responsive design

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page with platform overview
│   ├── machines/
│   │   ├── page.tsx               # Main machines overview
│   │   ├── htb/
│   │   │   ├── page.tsx           # HTB machines list
│   │   │   └── [slug]/            # Individual HTB machine pages
│   │   └── thm/
│   │       ├── page.tsx           # THM rooms list
│   │       └── [slug]/            # Individual THM room pages
│   ├── api/
│   │   └── admin/
│   │       ├── htb-machines-d1/   # HTB machine CRUD operations
│   │       ├── htb-stats-d1/      # HTB profile statistics
│   │       ├── thm-rooms-d1/      # THM room CRUD operations
│   │       └── thm-stats-d1/      # THM profile statistics
│   └── [other routes...]
├── components/
│   ├── MachineCardBase.tsx        # Unified machine/room card component
│   ├── Layout.tsx                 # Main layout wrapper
│   ├── Header.tsx                 # Navigation with platform selection
│   └── [other components...]
├── data/
│   ├── machines.json              # HTB machine static data
│   └── thm-rooms.json             # THM room static data
└── lib/
    ├── db.ts                      # Database utilities for both platforms
    └── seo-helpers.ts             # SEO metadata generation
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account (for D1 database)
- Vercel account (for deployment)

### Environment Variables
```bash
# Cloudflare D1 Database
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id  
CLOUDFLARE_DATABASE_ID=your_database_id


```

### Local Development
```bash
# Install dependencies
npm install

# Setup database (if using Cloudflare D1)
npx wrangler d1 create lab-database
npx wrangler d1 execute lab-database --file=./database/schema.sql

# Start development server
npm run dev
```

### Database Setup
The application supports both Cloudflare D1 and local development:

1. **Cloudflare D1 (Production)**:
   - Create D1 database: `npx wrangler d1 create lab-database`
   - Apply schema: `npx wrangler d1 execute lab-database --file=./database/schema.sql`
   - Set environment variables

2. **Local Development**:
   - Uses fallback static data from JSON files
   - Database operations gracefully degrade to file-based storage

## 🎯 Platform Features

### Hack The Box Integration
- Machine tracking with completion status
- Difficulty-based filtering and search
- Detailed writeups with exploit techniques
- Progress statistics and global ranking
- OS-specific categorization (Windows/Linux)

### TryHackMe Integration  
- Room completion tracking with points system
- Badge and achievement display
- Learning path progression
- External links to THM platform
- Beginner-friendly content organization

### Unified Experience
- Consistent UI/UX across both platforms
- Cross-platform statistics dashboard
- Unified search and filtering
- Responsive design for all devices
- Dark/light theme support

## 🔧 Database Schema

### HTB Tables
- `htb_machines`: Machine details, writeups, and progress
- `htb_stats`: User statistics and rankings

### THM Tables
- `thm_rooms`: Room information and completion data
- `thm_stats`: User profile with badges and streaks

### Shared Tables
- `cache_data`: API response caching
- `admin_logs`: Administrative action tracking

## 🚀 Deployment

### Vercel Deployment
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Cloudflare Workers (Alternative)
```bash
# Deploy to Cloudflare Workers
npm run build
npx wrangler deploy
```

## 🔐 Admin Features

- **Secure Authentication**: Password-based admin access
- **Content Management**: Add, edit, and delete machines/rooms
- **Statistics Updates**: Manual override of profile statistics  
- **Database Operations**: Direct database management interface
- **Audit Logging**: Track all administrative changes

## 📊 Performance & SEO

- **Static Generation**: Pre-rendered pages for optimal performance
- **Dynamic Metadata**: Auto-generated SEO tags for each machine/room
- **Image Optimization**: Next.js automatic image optimization
- **Responsive Design**: Mobile-first responsive layout
- **Core Web Vitals**: Optimized for Google's performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live**: [0xjerry.is-a.dev](https://0xjerry.is-a.dev/)
- **GitHub**: [github.com/Jery0843/0xJerry-s-Lab](https://github.com/jery0843/0xJerry-s-Lab)
- **Documentation**: See `/docs` directory for detailed setup guides

---

**Built with ❤️ for the cybersecurity community**
