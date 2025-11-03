# Setting Up in GitHub Codespaces

This guide will help you set up the n8n Researcher Forms application in GitHub Codespaces using **free tier services**.

## ✅ What You'll Need (All Free)

1. **n8n Cloud** (free tier - 2,500 executions/month)
2. **PostgreSQL Database** (free tier from Supabase, Neon, or ElephantSQL)
3. **GitHub Codespace** (you're already here!)

---

## Step 1: Set Up n8n Cloud (2 minutes)

1. Go to **[https://n8n.io/](https://n8n.io/)**
2. Click **"Get started free"**
3. Sign up with email or GitHub
4. After signup, you'll get your n8n instance URL:
   - Example: `https://yourname.app.n8n.cloud`
5. **Get your API key:**
   - Click the **Settings** icon (gear) in the bottom left
   - Go to **API**
   - Click **"Create an API Key"**
   - **Copy the API key** - you'll need this soon!

✅ **Save these for later:**
- Your n8n URL: `https://________.app.n8n.cloud`
- Your API key: `n8n_api_________________________________`

---

## Step 2: Set Up Free PostgreSQL Database (3 minutes)

Choose **one** of these free options:

### Option A: Neon (Recommended - Easiest)

1. Go to **[https://neon.tech/](https://neon.tech/)**
2. Sign up with GitHub
3. Create a new project
4. Copy the **Connection String** (looks like: `postgresql://user:pass@host/database`)

### Option B: Supabase

1. Go to **[https://supabase.com/](https://supabase.com/)**
2. Sign up and create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (choose "Pooler" for better performance)

### Option C: ElephantSQL

1. Go to **[https://www.elephantsql.com/](https://www.elephantsql.com/)**
2. Sign up and create a new instance (Tiny Turtle - Free)
3. Copy the **URL** from the details page

✅ **Save your database URL:**
```
postgresql://username:password@hostname:5432/database_name
```

---

## Step 3: Configure Your Environment

1. **Copy the example environment file:**
```bash
cp .env.example .env
```

2. **Edit the `.env` file:**
```bash
code .env
```

3. **Fill in your credentials:**
```env
# Database - paste your database URL here
DATABASE_URL="postgresql://your-connection-string-here"

# n8n Configuration - paste your n8n details
N8N_API_URL="https://your-instance.app.n8n.cloud"
N8N_API_KEY="your-n8n-api-key-here"

# Google Sheets (Optional - skip for now)
# GOOGLE_SHEETS_CREDENTIALS_JSON='...'
```

---

## Step 4: Initialize the Database

Run these commands in your Codespace terminal:

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push
```

You should see:
```
✔ Generated Prisma Client
✔ Database synchronized
```

---

## Step 5: Start the Application

```bash
npm run dev
```

The app will start on **port 3000**. Codespaces will automatically forward the port and give you a URL.

Click the **"Open in Browser"** notification or go to the **Ports** tab to open your app!

---

## 🎉 You're Ready!

Now you can:

1. ✅ Open your app in the browser
2. ✅ Create a new project
3. ✅ Create a form
4. ✅ Generate an n8n workflow automatically
5. ✅ Get a shareable form link!

---

## 🐛 Troubleshooting

### Database Connection Failed

- Double-check your `DATABASE_URL` in `.env`
- Make sure your database service is running
- Try pinging the database host

### n8n API Errors

- Verify your `N8N_API_KEY` is correct
- Check that your n8n instance is accessible
- Make sure the URL starts with `https://` not `http://`

### Port Not Opening

- Go to the **Ports** tab in Codespaces
- Make sure port 3000 is forwarded
- Click the globe icon to open in browser

---

## 📚 Next Steps

Once everything is working:

1. Read **LEARNING.md** to understand the architecture
2. Read **README.md** for usage guide
3. Check **ARCHITECTURE.md** for technical details
4. Explore the **n8n workflow generator** code in `lib/n8n-generator.ts`

---

## 💡 Tips

- **Free tier limits:**
  - n8n: 2,500 executions/month
  - Neon: 10GB storage, 3 projects
  - Supabase: 500MB database, 2 projects

- **Google Sheets is optional** - responses are stored in your PostgreSQL database regardless

- **Your Codespace sleeps after inactivity** - that's normal! Just restart `npm run dev` when you come back

---

**Happy coding!** 🚀
