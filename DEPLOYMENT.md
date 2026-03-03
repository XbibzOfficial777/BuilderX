# Catbox Manager Pro - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/catbox-manager-pro)

### Option 2: Manual Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/catbox-manager-pro.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add PostgreSQL Database**
   - In Vercel Dashboard, go to your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres" (Neon or Vercel Postgres)
   - Copy the `DATABASE_URL` to Environment Variables

4. **Environment Variables** (Already configured in vercel.json)
   - Firebase config is pre-configured
   - Just add `DATABASE_URL` from your PostgreSQL database

## 📋 Environment Variables

The following are pre-configured in `vercel.json`:

| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_FIREBASE_API_KEY | AIzaSyAwitkeoSDxHgfQn4-eQ8t4_2BZ77ceIyo |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | studio-pcuih.firebaseapp.com |
| NEXT_PUBLIC_FIREBASE_DATABASE_URL | https://studio-pcuih-default-rtdb.firebaseio.com |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | studio-pcuih |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | studio-pcuih.firebasestorage.app |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | 262161066351 |
| NEXT_PUBLIC_FIREBASE_APP_ID | 1:262161066351:web:9957c8bd83f196dcc5e09a |
| NEXT_PUBLIC_CATBOX_USERHASH | 5248d18542a1e43ae36a18ba0 |

### Required (Add in Vercel Dashboard):
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string (from Vercel Postgres/Neon) |

## 🗄️ Database Setup

### Vercel Postgres (Recommended)
1. In Vercel Dashboard → Your Project → Storage
2. Create Database → Postgres
3. The `DATABASE_URL` will be automatically added

### Neon (Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string to `DATABASE_URL`

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (add `?pgbouncer=true` for pooler)

## 🔧 Local Development

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Run development server
bun run dev
```

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── login/        # Login page
│   │   ├── register/     # Register page
│   │   ├── files/        # File manager
│   │   ├── albums/       # Album manager
│   │   ├── chat/         # Chat feature
│   │   └── upload/       # Upload page
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   └── store/            # Zustand store
├── prisma/               # Database schema
├── public/               # Static assets
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Firebase Authentication
- **Realtime**: Firebase Realtime Database
- **Storage**: Catbox.moe API
- **State**: Zustand

## 🚢 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Import project to Vercel
- [ ] Create PostgreSQL database in Vercel
- [ ] Add DATABASE_URL environment variable
- [ ] Deploy!
- [ ] Test all features

## 📝 Notes

- Firebase configuration is embedded in `vercel.json`
- The app uses Firebase Realtime Database for most features
- PostgreSQL is set up for potential server-side features
- Catbox.moe handles file uploads

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
