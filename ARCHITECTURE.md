# Architecture Documentation

## System Overview

n8n Researcher Forms is a full-stack application that enables researchers to create AI-powered conversational forms without writing code. The system automatically generates n8n workflows that conduct intelligent interviews with participants.

## High-Level Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│  Researcher │────────▶│   Next.js    │────────▶│     n8n     │
│   Browser   │         │   App        │         │  Workflows  │
│             │         │              │         │             │
└─────────────┘         └──────┬───────┘         └──────┬──────┘
                               │                        │
                               │                        │
                               ▼                        ▼
                        ┌──────────────┐        ┌──────────────┐
                        │              │        │              │
                        │  PostgreSQL  │        │    Google    │
                        │   Database   │        │    Sheets    │
                        │              │        │              │
                        └──────────────┘        └──────────────┘
                               ▲                        ▲
                               │                        │
┌─────────────┐                │                        │
│             │                └────────────────────────┘
│ Participant │──────────────────────────────────────────▶
│   Browser   │         (Submits responses via n8n form)
│             │
└─────────────┘
```

## Components

### 1. Frontend (Next.js + React)

**Location:** `/app`, `/components`

**Responsibilities:**
- User authentication (Google OAuth)
- Project and form management UI
- Dashboard for viewing forms and responses
- Client-side validation

**Key Pages:**
- `/` - Landing page
- `/dashboard` - Project list
- `/dashboard/projects/new` - Create project
- `/dashboard/projects/[id]` - Project details
- `/dashboard/projects/[id]/forms/new` - Create form

**Technologies:**
- Next.js 14 (App Router)
- React Server Components
- Client Components for interactive UI
- Tailwind CSS for styling

### 2. Backend API (Next.js API Routes)

**Location:** `/app/api`

**Responsibilities:**
- Authentication (NextAuth.js)
- CRUD operations for projects and forms
- n8n workflow generation and management
- Response data storage

**Key Endpoints:**
- `POST /api/auth/[...nextauth]` - Authentication
- `GET/POST /api/projects` - Project management
- `GET/DELETE /api/projects/[id]` - Single project
- `POST /api/projects/[id]/forms` - Form creation

**Technologies:**
- Next.js API Routes
- NextAuth.js for auth
- Zod for validation
- Axios for n8n API calls

### 3. Database (PostgreSQL + Prisma)

**Location:** `/prisma/schema.prisma`

**Schema:**

```prisma
User ──┬──▶ Account (OAuth)
       ├──▶ Session
       └──▶ Project ──▶ Form ──▶ Response
```

**Models:**
- **User** - Researcher accounts
- **Account** - OAuth provider data
- **Session** - Auth sessions
- **Project** - Research project
- **Form** - Interview form config
- **Response** - Participant answers

**Technologies:**
- PostgreSQL (relational database)
- Prisma ORM (type-safe database access)

### 4. n8n Integration

**Location:** `/lib/n8n-generator.ts`

**Responsibilities:**
- Generate workflow JSON from form config
- Create workflows via n8n API
- Activate/deactivate workflows
- Extract webhook URLs

**Workflow Structure:**
Each generated workflow includes:
1. **Form Trigger** - Captures initial response
2. **Set Topic** - Initializes conversation context
3. **AI Agent** - Generates interview questions
4. **Memory Buffer** - Maintains conversation history
5. **Conditional** - Checks if interview should stop
6. **Response Form** - Collects participant answers
7. **Loop** - Returns to AI for next question
8. **Completion** - Shows thank you message

**Technologies:**
- n8n API (REST)
- Axios for HTTP requests

### 5. Google Sheets Integration

**Location:** Configured in n8n workflows

**Responsibilities:**
- Store responses in researcher-friendly format
- Enable easy export and analysis
- Real-time response viewing

**Data Flow:**
1. Participant submits answer
2. n8n workflow receives it
3. Data saved to database (via API)
4. Data appended to Google Sheet

## Data Flow

### Creating a Form

```
Researcher fills form
      ↓
POST /api/projects/[id]/forms
      ↓
Validate data (Zod)
      ↓
Create Form in PostgreSQL
      ↓
Generate n8n workflow JSON
      ↓
POST to n8n API
      ↓
Activate workflow
      ↓
Extract webhook URL
      ↓
Update Form with workflow info
      ↓
Return form + URL to researcher
```

### Participant Completing Interview

```
Participant opens form URL
      ↓
n8n Form Trigger captures initial answer
      ↓
AI Agent generates first question
      ↓
Display question form to participant
      ↓
Participant answers
      ↓
Save to database & Google Sheets
      ↓
AI generates next question based on history
      ↓
Loop continues until:
  - Participant says "stop"
  - AI decides interview is complete
      ↓
Show completion message
      ↓
Clear conversation memory
```

## Authentication Flow

```
User clicks "Sign in with Google"
      ↓
Redirect to Google OAuth
      ↓
User grants permission
      ↓
Google redirects to /api/auth/callback/google
      ↓
NextAuth creates/updates User record
      ↓
Creates Session
      ↓
Sets session cookie
      ↓
User redirected to /dashboard
```

## Security

### Authentication
- Google OAuth 2.0 only (no passwords)
- NextAuth.js handles token management
- Secure HTTP-only cookies

### Authorization
- All API routes check session
- Projects tied to User ID
- Forms tied to Projects
- Users can only access their own data

### API Keys
- n8n API key in server env only
- Google credentials in server env only
- Never exposed to client

### Data Protection
- PostgreSQL with SSL in production
- Environment variables for secrets
- CSRF protection via NextAuth

## Scalability Considerations

### Database
- PostgreSQL scales vertically easily
- Indexes on frequently queried fields:
  - `Response.formId`
  - `Response.sessionId`
  - `Response.createdAt`
- Can add read replicas for analytics

### n8n
- Each form = separate workflow
- n8n can handle 1000s of workflows
- Workflows are stateless (memory in n8n DB)
- Can scale n8n horizontally with queue mode

### Application
- Next.js can be deployed to:
  - Vercel (auto-scaling)
  - AWS (EC2, ECS, Lambda)
  - Any Node.js host
- Static assets served via CDN
- API routes are serverless-ready

### Bottlenecks
1. **AI API calls** - Rate limits from LLM provider
2. **Google Sheets API** - 60 requests/minute/user
3. **Database connections** - Use connection pooling

## Technology Choices

### Why Next.js?
- Full-stack in one framework
- Great developer experience
- Built-in API routes
- Excellent TypeScript support
- Easy deployment (Vercel)
- React Server Components for performance

### Why PostgreSQL?
- Structured data (users, projects, forms)
- ACID compliance
- Great for relational data
- Mature tooling
- Prisma excellent for type safety

### Why Prisma?
- Type-safe database access
- Auto-generated TypeScript types
- Migrations built-in
- Great developer experience
- Works well with Next.js

### Why NextAuth.js?
- Easy OAuth integration
- Secure by default
- Works seamlessly with Prisma
- Handles sessions automatically
- Well-maintained

### Why n8n?
- Visual workflow builder
- Self-hostable
- Great AI nodes
- Form nodes built-in
- Extensible with custom nodes

## Future Improvements

### Performance
- [ ] Add Redis for session storage
- [ ] Cache project/form lists
- [ ] Implement pagination for responses
- [ ] Lazy load form responses

### Features
- [ ] Real-time response dashboard (WebSockets)
- [ ] Response analytics and visualization
- [ ] Export responses to CSV/JSON
- [ ] Form templates
- [ ] Multi-language support

### DevOps
- [ ] Add Docker Compose for local dev
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Monitoring and logging (Sentry)
- [ ] Database backups

### Infrastructure
- [ ] CDN for static assets
- [ ] Load balancer for API
- [ ] Database connection pooling
- [ ] Rate limiting
