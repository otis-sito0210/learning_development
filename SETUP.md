# Quick Setup Guide

This guide will get you up and running in ~15 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL installed or account created
- [ ] Google Cloud account
- [ ] n8n running (local or cloud)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL

**Local (macOS):**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb n8n_researcher_forms
```

**Local (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb n8n_researcher_forms
```

**Or use a cloud database:**
- Free tier: [Supabase](https://supabase.com), [Neon](https://neon.tech)
- Just create a database and get the connection string

### 3. Setup n8n

**Easiest way (Docker):**
```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Or sign up for n8n Cloud:** https://n8n.cloud

**Get API Key:**
1. Open http://localhost:5678
2. Create account if needed
3. Settings → API → Generate new API key

### 4. Google Cloud Setup (5 minutes)

#### A. Create Project
1. Go to https://console.cloud.google.com/
2. Create new project: "n8n-researcher-forms"

#### B. Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable:
   - "Google+ API"
   - "Google Sheets API"

#### C. Create OAuth Credentials
1. "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen (just fill in app name)
4. Choose "Web application"
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

#### D. Create Service Account (for Sheets)
1. "Credentials" → "Create Credentials" → "Service Account"
2. Name it "n8n-sheets-service"
3. Click on the created service account
4. Go to "Keys" tab
5. "Add Key" → "Create new key" → JSON
6. Download the JSON file

### 5. Create .env File

```bash
cp .env.example .env
```

Now edit `.env`:

```env
# 1. Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/n8n_researcher_forms"
# ↑ Change username, password, host if needed

# 2. Generate secret (run this command and paste output)
# openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-generated-secret-here"

# 3. Google OAuth (from step 4C)
GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"

# 4. n8n (from step 3)
N8N_API_URL="http://localhost:5678"
N8N_API_KEY="n8n_api_1234567890abcdef"

# 5. Google Sheets (content of JSON from step 4D)
GOOGLE_SHEETS_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

### 6. Initialize Database

```bash
npm run db:generate
npm run db:push
```

### 7. Start Development Server

```bash
npm run dev
```

### 8. Test It!

1. Open http://localhost:3000
2. Click "Sign in with Google"
3. Create a project
4. Create a form
5. Copy the form URL and open it in another browser tab

## Common Issues

### "Can't connect to database"
- Check PostgreSQL is running: `pg_isready`
- Check DATABASE_URL has correct credentials
- Try: `npx prisma db pull` to test connection

### "n8n API error"
- Check n8n is running: `curl http://localhost:5678`
- Verify API key is correct
- Check N8N_API_URL doesn't have trailing slash

### "Google OAuth error"
- Verify redirect URI exactly matches in Google Console
- Clear browser cookies
- Check GOOGLE_CLIENT_ID and SECRET are correct

### "Module not found"
- Run `npm install` again
- Delete node_modules and run `npm install`

## Quick Commands

```bash
# Development
npm run dev                 # Start dev server
npm run db:studio          # Open database GUI
npm run db:generate        # Generate Prisma client
npm run db:push            # Update database schema

# Production
npm run build              # Build for production
npm start                  # Start production server

# Database
npx prisma migrate dev     # Create migration
npx prisma db push         # Push schema changes
npx prisma db pull         # Pull schema from DB
```

## Next Steps

After setup:
1. Read the [README.md](README.md) for full documentation
2. Explore the codebase
3. Customize the AI prompts
4. Deploy to production (see README.md)

## Need Help?

- Check [README.md](README.md) for detailed docs
- Check [n8n documentation](https://docs.n8n.io/)
- Check [Next.js documentation](https://nextjs.org/docs)
- Check [Prisma documentation](https://www.prisma.io/docs)
