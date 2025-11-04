# Quick Demo Setup Guide

Get your n8n Researcher Forms app running in **15 minutes** and see a live demo!

## 🎯 What You'll See

A working web application where:
- Researchers can create AI-powered conversational forms
- Forms automatically generate n8n workflows
- Participants can have interactive "never-ending" interviews with AI
- Responses are saved to PostgreSQL and Google Sheets

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

### Step 2: Set Up External Services (10 minutes)

You need 2 free services to run this demo:

#### A) PostgreSQL Database (Choose one - 3 minutes)

**Option 1: Neon (Recommended - Fastest)**
1. Go to https://neon.tech
2. Sign up with GitHub (instant)
3. Create new project → Copy connection string
4. Example: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`

**Option 2: Supabase**
1. Go to https://supabase.com
2. Create project → Settings → Database → Copy connection string (Pooler)

**Option 3: ElephantSQL**
1. Go to https://www.elephantsql.com
2. Create "Tiny Turtle" (free) instance → Copy URL

#### B) n8n Self-Hosted (Choose one - 5 minutes)

⚠️ **Important:** n8n Cloud free tier does NOT include API access. You must use self-hosted!

**Option 1: Railway.app (Recommended)**
- $5 free credits per month
- Always online
- See [N8N_SETUP.md](./N8N_SETUP.md) for detailed Railway setup

**Option 2: Render.com**
- Completely free
- Sleeps after 15min inactivity (good for demos)
- See [N8N_SETUP.md](./N8N_SETUP.md) for detailed Render setup

**After setup, you'll have:**
- n8n URL: `https://your-app.railway.app` (or similar)
- API Key: From n8n Settings → API → Create API Key

### Step 3: Configure Environment (3 minutes)

Create your `.env` file:

```bash
cp .env.local.example .env
```

Edit `.env` with your credentials:

```env
# Database - paste your connection string
DATABASE_URL="postgresql://your-connection-string-here"

# n8n - paste your instance details
N8N_API_URL="https://your-n8n-instance-url-here"
N8N_API_KEY="n8n_api_your_key_here"

# NextAuth - generate secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run-this-command-below-to-generate"

# Google OAuth (Optional for demo - can skip)
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."

# Google Sheets (Optional - can skip for demo)
# GOOGLE_SHEETS_CREDENTIALS_JSON='...'
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in your `.env` file.

---

## 🎬 Initialize & Run

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Start the dev server
npm run dev
```

Visit **http://localhost:3000** in your browser!

---

## 🎭 Demo Walkthrough

### What to Try:

1. **Sign in** (if you set up Google OAuth, otherwise skip auth for now)

2. **Create a Project**
   - Click "New Project"
   - Name: "User Research Demo"
   - Description: "Testing AI-powered interviews"

3. **Create a Form**
   - Click "New Form"
   - Form name: "Product Feedback Survey"
   - Interview topic: "their experience with our product"
   - Initial question: "What is your name?"
   - Click "Create Form & Generate Workflow"

4. **See the Magic** ✨
   - System automatically creates an n8n workflow
   - You get a shareable form URL
   - The workflow includes AI logic for follow-up questions

5. **Test the Form**
   - Open the generated form URL
   - Answer questions
   - Watch AI generate contextual follow-ups
   - Type "stop interview" to end

6. **View Responses**
   - See responses in your PostgreSQL database
   - (If configured) Check Google Sheets for responses

---

## 🎥 Expected Demo Flow

### Researcher View:
```
Homepage → Sign In → Dashboard → New Project → New Form
  ↓
Form Created! 🎉
  ↓
Copy shareable link: https://yourdomain.com/form/abc123
  ↓
Share with participants
```

### Participant View:
```
Open form link → See welcome message
  ↓
Answer initial question: "John Doe"
  ↓
AI asks: "Thanks John! What features do you use most?"
  ↓
Answer: "I use the dashboard daily"
  ↓
AI asks: "What do you like about the dashboard?"
  ↓
... conversation continues ...
  ↓
Type "stop interview" → See completion message
```

### Behind the Scenes:
- Each answer triggers n8n workflow
- AI generates next question based on context
- All responses saved to database + Google Sheets
- Researcher can view all responses in real-time

---

## 🛠️ Quick Troubleshooting

### Database Connection Failed
```bash
# Test Prisma connection
npx prisma db pull
```
- Check `DATABASE_URL` format
- Verify database is accessible from your network

### n8n API Errors
- Verify n8n instance is running (visit the URL)
- Check API key is correct
- Ensure API is enabled in n8n Settings → API

### Port 3000 Already in Use
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Missing Google OAuth (Optional)
- For demo purposes, you can skip Google authentication
- Modify the code to bypass auth temporarily
- Or set up Google OAuth following README.md

---

## 📊 What's Happening Under the Hood?

1. **Next.js Frontend** (React + TypeScript)
   - Dashboard for researchers
   - Form builder interface
   - Response viewer

2. **Next.js API Routes** (Backend)
   - Project & form management
   - n8n workflow generator
   - Database operations

3. **n8n Workflows** (Automation)
   - Webhook endpoint for form submissions
   - AI integration for follow-up questions
   - Dual storage (PostgreSQL + Google Sheets)

4. **PostgreSQL Database**
   - Users, projects, forms, responses
   - Managed via Prisma ORM

---

## 📖 Explore More

After seeing the demo:

- **[README.md](./README.md)** - Full feature documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep-dive
- **[N8N_SETUP.md](./N8N_SETUP.md)** - Detailed n8n hosting guide
- **[CODESPACE_SETUP.md](./CODESPACE_SETUP.md)** - GitHub Codespaces setup
- **[LEARNING.md](./LEARNING.md)** - Learning resources

---

## 🚧 Demo Limitations (Free Tier)

- **n8n:** 2,500 workflow executions/month
- **Neon:** 10GB storage, 3 projects
- **Railway:** $5 credits/month (plenty for demos)
- **Render:** Free but sleeps after 15min inactivity

Perfect for demos, testing, and small research projects!

---

## 🎉 Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL database created and connected
- [ ] n8n instance running with API access
- [ ] `.env` file configured
- [ ] Database initialized (`npm run db:generate` + `npm run db:push`)
- [ ] App running on `http://localhost:3000`
- [ ] Created a test project and form
- [ ] Successfully generated n8n workflow
- [ ] Tested form as a participant
- [ ] Saw responses in database

---

## 🆘 Need Help?

1. Check **[README.md](./README.md)** troubleshooting section
2. Review logs in terminal for error messages
3. Test each service individually:
   - Database: `npx prisma studio`
   - n8n: Visit your n8n URL
   - App: Check browser console (F12)

---

**Ready to see your app in action? Start with Step 1!** 🚀
