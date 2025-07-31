# 0xJerry's Lab - Deployment Guide

## 🚀 Deployment Options

### Option 1: Cloudflare Pages (Recommended)
**Best for D1 database integration**

1. **Upload your code to GitHub**
2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Build output directory: `.next`

3. **Configure D1 Database**:
   - Create D1 database: `npx wrangler d1 create jerrys-lab`
   - Run migrations: `npx wrangler d1 execute jerrys-lab --file=database/schema.sql --remote`
   - Bind database in Cloudflare Pages settings

### Option 2: Vercel/Netlify (API Method)
**Uses Cloudflare D1 API**

**Required Environment Variables:**
```bash
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id  
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_DATABASE_NAME=jerrys-lab
ADMIN_PASSWORD=your_admin_password
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create D1 database
npx wrangler d1 create jerrys-lab

# Run database migrations
npx wrangler d1 execute jerrys-lab --file=database/schema.sql --remote
```

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and update with your values.

### 4. Build & Deploy
```bash
npm run build
```

## 🗄️ Database Connection Methods

The app automatically detects the best connection method:

1. **Cloudflare Runtime** (Pages/Workers): Direct D1 binding
2. **API Method** (Other hosts): Uses Cloudflare D1 REST API
3. **Local Development**: Uses environment variables

## 🔒 Security Notes

- Keep your Cloudflare API token secure
- Use environment variables, never hardcode credentials
- The admin password should be strong and unique

## 📊 Features Included

- ✅ HTB machine management
- ✅ Dynamic stats dashboard  
- ✅ SEO optimization with sitemaps
- ✅ News & forums integration
- ✅ Admin authentication system
- ✅ Responsive design
- ✅ Database integration (D1)

## 🐛 Troubleshooting

**Database not connecting?**
- Check environment variables are set correctly
- Verify Cloudflare API token has D1 permissions
- Check Cloudflare account ID and database ID

**Build failing?**
- Run `npm install` first
- Check Node.js version (16+ required)
- Verify all environment variables are set
