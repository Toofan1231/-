# Paint & Varnish Shop Accounting System
AfghanPaint.app - Complete Business Management Solution

## 🌟 Features
- **Mobile-First Design**: 100% optimized for mobile devices
- **Multi-Language Support**: English, Dari (دری), Pashto (پښتو)
- **Business Management**: Inventory, Sales, Accounting
- **User Management**: Admin and Staff roles
- **Real-time Reporting**: Sales analytics and insights

## 🚀 Quick Deploy to AfghanPaint.app

### Method 1: Render.com (Recommended - Free with custom domain)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Add Environment Variables**:
     ```
     NODE_ENV=production
     PORT=5000
     DATABASE_URL=postgresql://user:password@host:port/database
     JWT_SECRET=your_secure_jwt_secret_here
     CORS_ORIGIN=https://afghanpaint.app
     ```

3. **Add Custom Domain**
   - In Render dashboard → Settings → Custom Domains
   - Add `afghanpaint.app`
   - Follow DNS setup instructions

### Method 2: Railway.app (Easy Deployment)

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Railway will auto-detect Node.js and deploy
   - **Add PostgreSQL Database**: Click "Add Service" → "PostgreSQL"

2. **Environment Setup**
   Railway auto-provides `DATABASE_URL`, just set:
   ```
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret_here
   CORS_ORIGIN=https://afghanpaint.app
   ```

3. **Custom Domain**
   - Project Settings → Domains
   - Add `afghanpaint.app`

### Method 3: Fly.io (Global Performance)

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   flyctl auth login
   ```

2. **Deploy**
   ```bash
   flyctl launch
   # Choose: Yes to deploy now
   # Choose: Node.js
   # Enter app name: afghanpaint-app
   ```

3. **Setup Database**
   ```bash
   flyctl postgres create --name afghanpaint-db
   flyctl postgres attach afghanpaint-db
   ```

4. **Add Domain**
   ```bash
   flyctl domains add afghanpaint.app
   flyctl certs create afghanpaint.app
   ```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Start development server
npm run dev
```

## 📱 Mobile App Access
Once deployed, your app will be available at:
- **Main URL**: https://afghanpaint.app
- **Admin Panel**: https://afghanpaint.app/admin.html
- **API**: https://afghanpaint.app/api/*

## 🌐 Domain Setup

1. **Buy Domain**: Purchase afghanpaint.app from:
   - Namecheap
   - GoDaddy
   - Cloudflare
   - Google Domains

2. **DNS Configuration**:
   - Point to your hosting provider's servers
   - Most platforms provide specific DNS records

## 📊 Database Features
- User Management (Admin/Staff)
- Product Catalog
- Inventory Tracking
- Sales Management
- Supplier Management
- Financial Reporting

## 🔒 Security
- JWT Authentication
- Password Hashing (bcrypt)
- CORS Protection
- Input Validation

## 📱 Mobile Features
- Responsive Design
- Touch-Friendly Interface
- Offline Capabilities
- Fast Loading
- PWA Ready

## 🎨 Languages Supported
- **English** (Default)
- **Dari** (دری) - Afghanistan Persian
- **Pashto** (پښتو) - Afghanistan Pashto

## 💰 Cost Estimate
- **Hosting**: Free (Render/Railway/Fly.io)
- **Database**: Free (25MB-8GB on free tiers)
- **Domain**: ~$12/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$12/year

## 🆘 Need Help?
1. Check deployment logs in your hosting platform
2. Verify environment variables
3. Test database connection: `/api/health`
4. Check browser console for frontend issues

## 🔄 Updates
To update your live app:
```bash
git add .
git commit -m "Update message"
git push origin main
# Hosting platform auto-deploys!
```

---

**AfghanPaint.app** - Your complete paint shop management solution! 🎨