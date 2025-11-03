# Learning Guide: Understanding This Project

Since you mentioned this is your first time building something robust, this guide explains the architecture and concepts used in this project to help you learn.

## Project Overview

You've built a **SaaS (Software as a Service) platform** where researchers can create AI-powered interview forms. The key technologies are:

- **Frontend**: Next.js + React (what users see)
- **Backend**: Next.js API Routes (handles data and logic)
- **Database**: PostgreSQL (stores user data)
- **Integration**: n8n (runs the actual interviews)

## Key Concepts

### 1. Full-Stack Application

Unlike traditional apps where frontend and backend are separate, Next.js combines both:

```
Traditional:
React App (port 3000) ←→ Express API (port 5000) ←→ Database

Next.js:
Next.js (port 3000)
  ├── Pages (React components)
  ├── API Routes (Backend endpoints)
  └── Database access
```

**Why?** Simpler deployment, better performance, shared code.

### 2. Server Components vs Client Components

Next.js 14 introduces a new pattern:

**Server Components** (default in `/app`)
- Run on the server
- Can access database directly
- No JavaScript sent to browser
- Example: `/app/dashboard/page.tsx`

```tsx
// This runs on the server
export default async function Dashboard() {
  const projects = await prisma.project.findMany(); // Direct DB access!
  return <div>{projects.map(p => <ProjectCard {...p} />)}</div>;
}
```

**Client Components** (marked with `"use client"`)
- Run in the browser
- Can use hooks (useState, useEffect)
- Interactive features
- Example: `/app/dashboard/projects/new/page.tsx`

```tsx
"use client";

export default function NewProject() {
  const [loading, setLoading] = useState(false); // Hooks require client
  // ... handle form submission
}
```

**Rule of thumb:** Use Server Components by default. Only use Client Components when you need interactivity.

### 3. File-Based Routing

In Next.js, the file structure defines your routes:

```
app/
├── page.tsx                    → /
├── dashboard/
│   ├── page.tsx                → /dashboard
│   └── projects/
│       ├── new/
│       │   └── page.tsx        → /dashboard/projects/new
│       └── [projectId]/
│           └── page.tsx        → /dashboard/projects/123
```

The `[projectId]` is a **dynamic route** - it matches any value.

### 4. API Routes

API routes live in `/app/api/` and handle backend logic:

```
app/api/
├── auth/[...nextauth]/route.ts  → POST /api/auth/signin
└── projects/
    ├── route.ts                 → GET /api/projects
    └── [projectId]/
        └── route.ts             → GET /api/projects/123
```

Each `route.ts` exports functions for HTTP methods:

```ts
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}
```

### 5. Database with Prisma ORM

**ORM** = Object-Relational Mapping. It lets you work with databases using objects instead of SQL.

**Traditional SQL:**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

**Prisma:**
```ts
const user = await prisma.user.findFirst({
  where: { email: 'user@example.com' }
});
```

**Schema Definition** (`prisma/schema.prisma`):
```prisma
model User {
  id       String    @id @default(cuid())
  email    String    @unique
  projects Project[]
}

model Project {
  id     String @id @default(cuid())
  name   String
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

This creates TypeScript types automatically! Prisma knows a `User` has `projects`.

### 6. Authentication with NextAuth.js

NextAuth handles user login/logout/sessions:

**Flow:**
1. User clicks "Sign in with Google"
2. Redirected to Google
3. User grants permission
4. Google sends user back with token
5. NextAuth creates session
6. User is logged in

**In your code:**
```tsx
// Check if user is logged in
const session = await getServerSession(authOptions);
if (!session) redirect('/');

// Get user ID
const userId = session.user.id;
```

### 7. TypeScript Benefits

TypeScript adds types to JavaScript:

**JavaScript (no types):**
```js
function createProject(data) {
  // What is data? What properties does it have? 🤷
  return fetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

**TypeScript (with types):**
```ts
interface ProjectData {
  name: string;
  description?: string;
}

function createProject(data: ProjectData) {
  // IDE knows data has name and maybe description!
  // Autocomplete works! Catches errors before runtime!
  return fetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

### 8. Environment Variables

Secrets and config go in `.env`:

```env
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_SECRET="secret123"
```

**Access in code:**
```ts
const apiKey = process.env.N8N_API_KEY;
```

**Important:** Never commit `.env` to git! Use `.env.example` as a template.

## Architecture Patterns Used

### 1. Three-Tier Architecture

```
┌─────────────────────┐
│  Presentation Layer │  ← React components, forms, UI
│  (Frontend/UI)      │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Application Layer  │  ← API routes, business logic
│  (Backend/API)      │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Data Layer        │  ← PostgreSQL, Prisma ORM
│   (Database)        │
└─────────────────────┘
```

Each layer has a specific responsibility. This makes code easier to test and maintain.

### 2. REST API Pattern

Your API follows REST (Representational State Transfer):

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/123` - Get specific project
- `DELETE /api/projects/123` - Delete project

**Resources** (projects, forms) are accessed via URLs.
**Methods** (GET, POST, DELETE) define actions.

### 3. Validation with Zod

Before saving data, validate it:

```ts
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

// Parse and validate
const data = projectSchema.parse(body); // Throws if invalid
```

This prevents bad data from entering your database.

### 4. Separation of Concerns

Each file has one job:

- `/app/page.tsx` - UI only
- `/app/api/projects/route.ts` - API logic only
- `/lib/prisma.ts` - Database connection only
- `/lib/n8n-generator.ts` - n8n workflow logic only

**Why?** Easier to find bugs, test code, and add features.

## Comparing to Rails

You know Ruby on Rails, so here's a comparison:

| Rails | Next.js + Prisma |
|-------|------------------|
| Model (ActiveRecord) | Prisma model |
| Controller | API route handler |
| View (ERB) | React component |
| Migration | Prisma migration |
| `rails new` | `create-next-app` |
| `rails server` | `npm run dev` |
| `rails console` | `npx prisma studio` |
| Routes (`routes.rb`) | File structure |
| Gems | npm packages |

**Key Difference:** Rails is opinionated (one way to do things). Next.js is flexible (many ways to do things).

## Important Files to Understand

### `/app/layout.tsx`
Root layout - wraps all pages. Sets up auth provider, global styles.

### `/lib/auth.ts`
NextAuth configuration. Defines how users log in.

### `/lib/prisma.ts`
Database connection. Singleton pattern ensures one connection.

### `/lib/n8n-generator.ts`
Creates n8n workflows. This is the "magic" - turns form config into working interview.

### `/prisma/schema.prisma`
Database schema. Define your data models here.

### `/app/api/projects/[projectId]/forms/route.ts`
Form creation API. Shows full flow: validation → DB → n8n → response.

## Common Patterns You'll See

### 1. Async/Await

JavaScript is asynchronous. Use `async/await` for cleaner code:

**Old way (callbacks):**
```js
fetch('/api/projects')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Modern way (async/await):**
```js
try {
  const res = await fetch('/api/projects');
  const data = await res.json();
  console.log(data);
} catch (err) {
  console.error(err);
}
```

### 2. Destructuring

Extract values from objects:

```js
// Without destructuring
const name = user.name;
const email = user.email;

// With destructuring
const { name, email } = user;

// In function parameters
function greet({ name, email }) {
  return `Hello ${name} (${email})`;
}
```

### 3. Spread Operator

Copy objects/arrays:

```js
const user = { name: 'Alice', age: 30 };
const updatedUser = { ...user, age: 31 }; // { name: 'Alice', age: 31 }

const arr = [1, 2, 3];
const newArr = [...arr, 4, 5]; // [1, 2, 3, 4, 5]
```

### 4. Optional Chaining

Safely access nested properties:

```js
// Without optional chaining
const url = project && project.forms && project.forms[0] && project.forms[0].url;

// With optional chaining
const url = project?.forms?.[0]?.url;
```

## Learning Resources

### Next.js
- [Official Tutorial](https://nextjs.org/learn)
- [App Router Docs](https://nextjs.org/docs/app)

### Prisma
- [Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [Data Modeling](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)

### TypeScript
- [TypeScript in 5 Minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [React with TypeScript](https://react-typescript-cheatsheet.netlify.app/)

### React (if needed)
- [New React Docs](https://react.dev/learn)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

## Debugging Tips

### 1. Check Logs

**Server logs** (terminal running `npm run dev`):
```
POST /api/projects 200 in 145ms
```

**Browser console** (F12 in browser):
```js
console.log('Debug:', data);
```

### 2. Use Prisma Studio

Visual database browser:
```bash
npm run db:studio
```

Opens http://localhost:5555 - browse your data!

### 3. Check Network Tab

In browser DevTools (F12) → Network tab:
- See all API requests
- Check request/response data
- Identify failed requests

### 4. TypeScript Errors

Read the error message! TypeScript tells you exactly what's wrong:

```
Type 'string | undefined' is not assignable to type 'string'
```

Means: a value might be undefined, but you're treating it as always present.

**Fix:** Add a check:
```ts
if (value) {
  // Now TypeScript knows value is not undefined
}
```

## Next Steps for Learning

1. **Modify the AI prompt** - Change the system prompt in form creation
2. **Add a new field** to the Project model - Practice Prisma migrations
3. **Add a new API endpoint** - Practice API routes
4. **Customize the UI** - Practice React and Tailwind
5. **Add response filtering** - Practice database queries

## Questions to Explore

- How does NextAuth create sessions?
- How does Prisma generate types?
- How does the n8n workflow JSON structure work?
- How are environment variables loaded?
- How does React Server Components differ from traditional React?

**Experiment!** Break things, read error messages, fix them. That's how you learn.

## Getting Help

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **n8n Docs**: https://docs.n8n.io
- **Stack Overflow**: Search your error messages
- **ChatGPT/Claude**: Explain code or errors

Remember: Every expert was once a beginner. Take it one step at a time!
