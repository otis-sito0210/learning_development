# n8n Researcher Forms

A full-stack platform for researchers to create AI-powered conversational forms using n8n workflows. Enables never-ending interviews with intelligent follow-up questions powered by AI.

## 🎯 Features

- **Easy Form Creation**: Simple interface for researchers to create conversational interview forms
- **AI-Powered Interviews**: Leverages AI to generate contextual follow-up questions
- **Automated Workflow Generation**: Automatically creates and deploys n8n workflows
- **Dual Storage**: Responses saved to both PostgreSQL and Google Sheets
- **Google OAuth**: Secure authentication with Google accounts
- **Shareable Links**: Generate unique URLs for each form to distribute to participants
- **Real-time Responses**: View responses as they come in

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

**Backend:**
- Next.js API Routes
- PostgreSQL (Database)
- Prisma ORM
- NextAuth.js (Authentication)

**Integration:**
- n8n (Workflow automation)
- Google Sheets API (Response storage)
- Google OAuth (Authentication)

### User Journey

1. **Researcher creates project** → Define research topic and AI instructions
2. **Generate form link** → System creates n8n workflow and returns shareable URL
3. **Collect responses** → Answers stored in PostgreSQL + Google Sheets

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- n8n instance (self-hosted or cloud)
- Google Cloud Project with OAuth credentials
- Google Service Account (for Sheets API)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd learning_development
npm install
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb n8n_researcher_forms
```

**Option B: Hosted PostgreSQL**
Use services like:
- [Supabase](https://supabase.com/) (Free tier)
- [Neon](https://neon.tech/) (Free tier)
- [Railway](https://railway.app/)
- AWS RDS, Heroku, etc.

### 3. n8n Setup

**Option A: Self-hosted (Docker)**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: n8n Cloud**
Sign up at [n8n.cloud](https://n8n.cloud)

**Get n8n API Key:**
1. Open n8n (http://localhost:5678)
2. Go to Settings → API
3. Create new API key
4. Copy the key

### 4. Google Cloud Setup

#### Enable Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google+ API
   - Google Sheets API
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy **Client ID** and **Client Secret**

#### Create Service Account for Sheets

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in details and create
4. Click on the service account → **Keys** tab
5. **Add Key** → **Create new key** → **JSON**
6. Download the JSON file
7. Copy entire JSON content for `.env`

### 5. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/n8n_researcher_forms"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# n8n Configuration
N8N_API_URL="http://localhost:5678"
N8N_API_KEY="your-n8n-api-key"

# Google Sheets (Service Account JSON)
GOOGLE_SHEETS_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 6. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### For Researchers

1. **Sign in** with your Google account
2. **Create a Project**
   - Click "New Project"
   - Enter project name and description
3. **Create a Form**
   - Open your project
   - Click "New Form"
   - Fill in:
     - Form name
     - Interview topic (what AI should ask about)
     - Initial question (usually name/identifier)
     - Optional: Custom form title, description, AI prompt
   - Click "Create Form & Generate Workflow"
4. **Share the Form**
   - Copy the generated form URL
   - Share with participants via email, social media, etc.
5. **View Responses**
   - Click "View Responses in Google Sheets"
   - Or query the database directly

### For Participants

1. Open the form URL shared by researcher
2. Answer the initial question
3. AI will ask follow-up questions based on your answers
4. Continue until you're done
5. Type "stop interview" to end the session
6. See completion message

## 🔧 API Routes

### Projects

- `GET /api/projects` - List all projects for authenticated user
- `POST /api/projects` - Create new project
- `GET /api/projects/[projectId]` - Get project details
- `DELETE /api/projects/[projectId]` - Delete project

### Forms

- `POST /api/projects/[projectId]/forms` - Create form and generate n8n workflow

## 🗄️ Database Schema

### User
- Authentication and profile info

### Project
- Research project container
- Belongs to User

### Form
- Conversational form configuration
- Belongs to Project
- Links to n8n workflow

### Response
- Individual answers from participants
- Belongs to Form

## 🔐 Security Notes

- All routes require authentication via NextAuth
- API keys stored in environment variables
- Never commit `.env` file
- Google OAuth provides secure sign-in
- CSRF protection built into NextAuth

## 🚢 Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Updates for Production

Update in `.env` or Vercel settings:

```env
NEXTAUTH_URL="https://your-domain.com"
N8N_API_URL="https://your-n8n-instance.com"
```

### Database Migration

For production, use Prisma migrations:

```bash
npx prisma migrate dev --name init
```

## 🛠️ Development

### Database Management

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Reset database
npx prisma db push --force-reset
```

### Adding Dependencies

```bash
npm install <package-name>
```

## 📚 Project Structure

```
learning_development/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth routes
│   │   └── projects/             # Project & form APIs
│   ├── dashboard/                # Dashboard pages
│   │   └── projects/             # Project management
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
├── lib/                          # Utilities
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client
│   └── n8n-generator.ts          # Workflow generator
├── prisma/                       # Database schema
│   └── schema.prisma
├── types/                        # TypeScript types
└── .env                          # Environment variables
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull
```

### n8n Connection Issues

- Verify n8n is running: `curl http://localhost:5678`
- Check API key is correct
- Ensure n8n API is enabled in settings

### OAuth Issues

- Verify redirect URI matches exactly in Google Console
- Check NEXTAUTH_URL is correct
- Clear browser cookies and retry

## 📝 TODO / Future Enhancements

- [ ] Add response analytics dashboard
- [ ] Export responses to CSV
- [ ] Custom branding for forms
- [ ] Multi-language support
- [ ] Webhook notifications for new responses
- [ ] Form templates library
- [ ] Collaborative project sharing
- [ ] Advanced AI prompt builder
- [ ] Integration with more LLM providers

## 🤝 Contributing

This is a learning project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use for your research projects!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [n8n](https://n8n.io/)
- Template inspiration from n8n community

---

**Questions?** Open an issue or reach out!
